import { useEffect, useMemo, useRef, useState } from "react";
import { rolloverTomorrowIntoToday } from "../features/day-cycle/day-rollover";
import { toLocalDateKey } from "../features/day-cycle/local-date";
import {
  hasCompletedEveningReview,
  moveOpenTodayTasksToTomorrow,
  openTodayTasks
} from "../features/evening-review/evening-review-flow";
import { eveningReviewCopy } from "../features/evening-review/evening-review-copy";
import { getGrowthStageFromState } from "../features/growth/growth-rules";
import type { GrowthEvent, GrowthEventType, GrowthState } from "../features/growth/growth-types";
import { getBasePetMood, type PetMood } from "../features/pet/pet-mood";
import { isEveningByTime, isQuietModeActive, quietModeUntil } from "../features/settings/settings-store";
import type {
  DesktopPlacementId,
  GlowIntensity,
  PetThemeId,
  QuietModeId
} from "../features/settings/settings-types";
import { abandonTask, addTask, moveTask, renameTask, toggleTaskDone } from "../features/tasks/task-reducer";
import { openTaskCount, tasksInBucket } from "../features/tasks/task-selectors";
import type { Task, TaskBucket } from "../features/tasks/task-types";
import { createId } from "../shared/lib/ids";
import { createDefaultAppData } from "./default-app-data";
import {
  canUseNativeAppData,
  listenForPersistedAppDataChanges,
  loadAppData,
  loadPersistedAppData,
  savePersistedAppData
} from "./app-storage";
import type { AppData, PanelMode, PetPosition } from "./app-types";

interface CompleteEveningReviewInput {
  localDate: string;
  message: string;
  growthEventType?: GrowthEventType;
  previousGrowth?: GrowthState;
}

interface AppModel {
  data: AppData;
  todayOpenCount: number;
  tomorrowOpenCount: number;
  displayMood: PetMood;
  isEvening: boolean;
  quietModeActive: boolean;
  gentleReminderMessage?: string;
  gentleReminderActive: boolean;
  activeCoDoTask?: Task;
  todayTasks: ReturnType<typeof tasksInBucket>;
  tomorrowTasks: ReturnType<typeof tasksInBucket>;
  reviewTasks: ReturnType<typeof openTodayTasks>;
  addTaskToBucket: (title: string, bucket: TaskBucket) => void;
  toggleTask: (id: string) => void;
  moveTaskToBucket: (id: string, bucket: TaskBucket) => void;
  renameTaskById: (id: string, title: string) => void;
  abandonTaskById: (id: string) => void;
  startEveningReview: () => void;
  closeEveningReview: () => void;
  moveAllOpenTodayToTomorrow: () => void;
  finishEveningReview: (message?: string) => void;
  setPanelMode: (mode: PanelMode) => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  setPetPosition: (position: PetPosition) => void;
  setPetThemeId: (themeId: PetThemeId) => void;
  setGlowIntensity: (intensity: GlowIntensity) => void;
  setCatchTomorrowEnabled: (enabled: boolean) => void;
  setGentleRemindersEnabled: (enabled: boolean) => void;
  setHoverInteractionEnabled: (enabled: boolean) => void;
  setQuietMode: (mode: QuietModeId) => void;
  setDesktopPlacement: (placement: DesktopPlacementId) => void;
  startCoDoTask: (id: string) => void;
  stopCoDoTask: () => void;
  catchTodayTasksForTomorrow: () => void;
  markGentleReminderShown: (message: string) => void;
  showMessage: (message: string, mood?: PetMood) => void;
}

interface PreparedAppData {
  data: AppData;
  changed: boolean;
}

const GENTLE_REMINDER_CAP_MS = 60 * 60 * 1000;
const GENTLE_REMINDER_VISIBLE_MS = 10 * 60 * 1000;
const CO_DO_CHECK_IN_MS = 45 * 60 * 1000;

interface GentleReminderCandidate {
  message: string;
  reason: "emptyToday" | "eveningCatch" | "coDoCheckIn";
}

export function completeEveningReviewState(
  current: AppData,
  input: CompleteEveningReviewInput
): AppData {
  const alreadyCompletedToday = hasCompletedEveningReview(
    input.localDate,
    current.dayCycle.lastEveningReviewDate
  );
  const nextReviewCount = alreadyCompletedToday
    ? current.growth.eveningReviewCount
    : current.growth.eveningReviewCount + 1;
  const nextGrowth = withGrowthStage({
    ...current.growth,
    eveningReviewCount: nextReviewCount,
    eveningReviewStreak: alreadyCompletedToday
      ? current.growth.eveningReviewStreak
      : current.growth.eveningReviewStreak + 1
  });
  const growthEvent = createGrowthEvent(
    input.previousGrowth ?? current.growth,
    nextGrowth,
    input.growthEventType ?? "eveningReview"
  );

  return {
    ...current,
    dayCycle: {
      ...current.dayCycle,
      lastEveningReviewDate: input.localDate
    },
    panel: {
      ...current.panel,
      mode: "tasks"
    },
    growth: nextGrowth,
    pet: {
      ...current.pet,
      mood: "happy",
      lastGrowthEvent: growthEvent,
      lastMessage: growthMessageForStage(growthEvent, input.message)
    }
  };
}

export function withGrowthStage(growth: GrowthState): GrowthState {
  return {
    ...growth,
    stage: getGrowthStageFromState(growth)
  };
}

function createGrowthEvent(
  previousGrowth: GrowthState,
  nextGrowth: GrowthState,
  type: GrowthEventType
): GrowthEvent {
  return {
    id: createId("growth"),
    type,
    at: new Date().toISOString(),
    stageBefore: previousGrowth.stage,
    stageAfter: nextGrowth.stage,
    stageChanged: previousGrowth.stage !== nextGrowth.stage
  };
}

function growthMessageForStage(event: GrowthEvent, fallback: string): string {
  if (!event.stageChanged) return fallback;

  switch (event.stageAfter) {
    case "smallGlow":
      return "小光团好像长大了一点。";
    case "starCore":
      return "身体里多了一点星尘光。";
    case "holdingGlow":
      return "它更会接住明天了。";
    case "dayNightCore":
      return "它把这些天的光都记住了。";
    default:
      return fallback;
  }
}

export function getGentleReminderCandidate(
  data: AppData,
  now: Date = new Date(),
  quietModeActive = isQuietModeActive(data.settings.quietMode, now)
): GentleReminderCandidate | undefined {
  if (!data.settings.gentleRemindersEnabled || quietModeActive) return undefined;

  if (data.pet.lastGentleReminderAt) {
    const lastReminderAt = new Date(data.pet.lastGentleReminderAt);
    if (!Number.isNaN(lastReminderAt.getTime()) && now.getTime() - lastReminderAt.getTime() < GENTLE_REMINDER_CAP_MS) {
      return undefined;
    }
  }

  const todayOpen = openTaskCount(data.tasks, "today");

  if (data.pet.activeCoDoTaskId && data.settings.coDoCheckInEnabled && data.pet.coDoStartedAt) {
    const coDoStartedAt = new Date(data.pet.coDoStartedAt);
    if (!Number.isNaN(coDoStartedAt.getTime()) && now.getTime() - coDoStartedAt.getTime() >= CO_DO_CHECK_IN_MS) {
      return {
        reason: "coDoCheckIn",
        message: "还陪你在这件事上。"
      };
    }
  }

  if (isEveningByTime(now, data.settings.workdayEndTime) && todayOpen > 0 && data.settings.catchTomorrowEnabled) {
    return {
      reason: "eveningCatch",
      message: `还有 ${todayOpen} 件，我可以轻轻接到明天。`
    };
  }

  if (todayOpen === 0 && now.getHours() >= 10 && now.getHours() < 18) {
    return {
      reason: "emptyToday",
      message: "今天可以先放一件很小的事。"
    };
  }

  return undefined;
}

function recentGentleReminderMessage(data: AppData, now: Date): string | undefined {
  if (!data.pet.lastGentleReminderAt || !data.pet.lastGentleReminderMessage) return undefined;

  const lastReminderAt = new Date(data.pet.lastGentleReminderAt);
  if (Number.isNaN(lastReminderAt.getTime())) return undefined;

  return now.getTime() - lastReminderAt.getTime() <= GENTLE_REMINDER_VISIBLE_MS
    ? data.pet.lastGentleReminderMessage
    : undefined;
}

export function prepareAppDataForToday(
  loaded: AppData,
  today: string = toLocalDateKey(new Date()),
  nowIso: string = new Date().toISOString()
): PreparedAppData {
  const rollover = rolloverTomorrowIntoToday({
    tasks: loaded.tasks,
    lastOpenedLocalDate: loaded.dayCycle.lastOpenedLocalDate,
    currentLocalDate: today,
    now: nowIso
  });

  if (!rollover.changed) {
    return {
      data: loaded,
      changed: false
    };
  }

  return {
    data: {
      ...loaded,
      tasks: rollover.tasks,
      dayCycle: {
        ...loaded.dayCycle,
        lastOpenedLocalDate: today,
        lastRolloverAt: nowIso
      },
      pet: {
        ...loaded.pet,
        lastMessage: "明天已经来到今天。"
      }
    },
    changed: true
  };
}

export function useAppModel(): AppModel {
  const [data, setData] = useState<AppData>(() => {
    const today = toLocalDateKey(new Date());
    const fallback = createDefaultAppData(today);
    const loaded = canUseNativeAppData() ? fallback : loadAppData(fallback);
    return prepareAppDataForToday(loaded, today).data;
  });
  const moodTimer = useRef<number | undefined>(undefined);
  const storageSourceId = useRef(createId("store"));
  const storageHydrated = useRef(!canUseNativeAppData());
  const skipNextPersist = useRef(false);

  useEffect(() => {
    let cancelled = false;

    if (!canUseNativeAppData()) return () => {};

    async function hydrateNativeData() {
      const today = toLocalDateKey(new Date());
      const loaded = await loadPersistedAppData(createDefaultAppData(today));
      const prepared = prepareAppDataForToday(loaded.data, today);

      if (cancelled) return;

      storageHydrated.current = true;
      skipNextPersist.current = loaded.hadNativeData && !prepared.changed;
      setData(prepared.data);
    }

    void hydrateNativeData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let cancelled = false;

    if (!canUseNativeAppData()) return () => {};

    async function subscribe() {
      unlisten = await listenForPersistedAppDataChanges(storageSourceId.current, () => {
        void loadPersistedAppData(createDefaultAppData(toLocalDateKey(new Date()))).then((loaded) => {
          if (cancelled) return;

          skipNextPersist.current = true;
          setData(prepareAppDataForToday(loaded.data).data);
        });
      });
    }

    void subscribe();

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    if (!storageHydrated.current) return;

    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }

    void savePersistedAppData(data, storageSourceId.current);
  }, [data]);

  useEffect(() => {
    return () => {
      if (moodTimer.current) window.clearTimeout(moodTimer.current);
    };
  }, []);

  const now = new Date();
  const isEvening = isEveningByTime(now, data.settings.workdayEndTime);
  const quietModeActive = isQuietModeActive(data.settings.quietMode, now);
  const todayOpenCount = openTaskCount(data.tasks, "today");
  const tomorrowOpenCount = openTaskCount(data.tasks, "tomorrow");
  const baseMood = getBasePetMood({ openTodayCount: todayOpenCount, isEvening });
  const displayMood = data.pet.mood === "happy" ? "happy" : baseMood;
  const activeCoDoTask = data.pet.activeCoDoTaskId
    ? data.tasks.find((task) => task.id === data.pet.activeCoDoTaskId && task.status === "open")
    : undefined;
  const gentleReminderMessage = quietModeActive ? undefined : recentGentleReminderMessage(data, now);
  const gentleReminderActive = Boolean(gentleReminderMessage);

  const model = useMemo(
    () => ({
      todayTasks: tasksInBucket(data.tasks, "today"),
      tomorrowTasks: tasksInBucket(data.tasks, "tomorrow"),
      reviewTasks: openTodayTasks(data.tasks)
    }),
    [data.tasks]
  );

  function update(updater: (current: AppData) => AppData): void {
    setData((current) => updater(current));
  }

  useEffect(() => {
    if (!storageHydrated.current) return;

    const now = new Date();
    const reminder = getGentleReminderCandidate(data, now, quietModeActive);
    if (!reminder) return;

    const nowIso = now.toISOString();
    setData((current) => {
      const currentQuietModeActive = isQuietModeActive(current.settings.quietMode, now);
      const currentReminder = getGentleReminderCandidate(current, now, currentQuietModeActive);
      if (!currentReminder) return current;

      return {
        ...current,
        pet: {
          ...current.pet,
          lastGentleReminderAt: nowIso,
          lastGentleReminderMessage: currentReminder.message
        }
      };
    });
  }, [data, quietModeActive]);

  function scheduleBaseMoodReset(): void {
    if (moodTimer.current) window.clearTimeout(moodTimer.current);

    moodTimer.current = window.setTimeout(() => {
      setData((current) => ({
        ...current,
        pet: {
          ...current.pet,
          mood: getBasePetMood({
            openTodayCount: openTaskCount(current.tasks, "today"),
            isEvening: isEveningByTime(new Date(), current.settings.workdayEndTime)
          })
        }
      }));
    }, 1300);
  }

  function maybeCompleteReviewIfCleared(current: AppData): AppData {
    if (current.panel.mode !== "eveningReview") return current;
    if (openTodayTasks(current.tasks).length > 0) return current;

    return completeEveningReviewState(current, {
      localDate: toLocalDateKey(new Date()),
      message: eveningReviewCopy.done
    });
  }

  function showMessage(message: string, mood?: PetMood): void {
    if (moodTimer.current) window.clearTimeout(moodTimer.current);

    update((current) => ({
      ...current,
      pet: {
        ...current.pet,
        mood: mood ?? current.pet.mood,
        lastGrowthEvent: undefined,
        lastMessage: message
      }
    }));

    if (mood === "happy") {
      scheduleBaseMoodReset();
    }
  }

  function addTaskToBucket(title: string, bucket: TaskBucket): void {
    const trimmed = title.trim();
    if (!trimmed) {
      showMessage("先写下一件小事。");
      return;
    }

    const nowIso = new Date().toISOString();
    update((current) => {
      const nextGrowth = withGrowthStage({
        ...current.growth,
        recordedTaskCount: current.growth.recordedTaskCount + 1
      });
      const growthEvent = createGrowthEvent(
        current.growth,
        nextGrowth,
        bucket === "today" ? "recordToday" : "recordTomorrow"
      );
      const message = bucket === "today" ? "放进今天了。" : "明天会接住它。";

      return {
        ...current,
        tasks: addTask(current.tasks, {
          id: createId("task"),
          title: trimmed,
          bucket,
          now: nowIso
        }),
        growth: nextGrowth,
        pet: {
          ...current.pet,
          lastGrowthEvent: growthEvent,
          lastMessage: growthMessageForStage(growthEvent, message)
        }
      };
    });
  }

  function toggleTask(id: string): void {
    const task = data.tasks.find((item) => item.id === id);
    const willComplete = Boolean(task && task.status !== "done");
    const nowIso = new Date().toISOString();

    update((current) => {
      const nextGrowth = willComplete
        ? withGrowthStage({
            ...current.growth,
            completedTaskCount: current.growth.completedTaskCount + 1
          })
        : current.growth;
      const growthEvent = willComplete
        ? createGrowthEvent(current.growth, nextGrowth, "completeTask")
        : undefined;
      const taskBeingToggled = current.tasks.find((item) => item.id === id);
      const shouldStopCoDo =
        willComplete &&
        current.pet.activeCoDoTaskId === id &&
        taskBeingToggled?.status === "open";

      const next = {
        ...current,
        tasks: toggleTaskDone(current.tasks, id, nowIso),
        growth: nextGrowth,
        pet: {
          ...current.pet,
          activeCoDoTaskId: shouldStopCoDo ? undefined : current.pet.activeCoDoTaskId,
          coDoStartedAt: shouldStopCoDo ? undefined : current.pet.coDoStartedAt,
          mood: willComplete ? "happy" : current.pet.mood,
          lastGrowthEvent: growthEvent,
          lastMessage: willComplete
            ? growthEvent
              ? growthMessageForStage(
                  growthEvent,
                  shouldStopCoDo ? "这件事已经被轻轻完成。" : "完成得很安静。"
                )
              : shouldStopCoDo
                ? "这件事已经被轻轻完成。"
                : "完成得很安静。"
            : "重新放回视线里。"
        }
      };

      return maybeCompleteReviewIfCleared(next);
    });

    if (willComplete) {
      scheduleBaseMoodReset();
    }
  }

  function moveTaskToBucket(id: string, bucket: TaskBucket): void {
    const nowIso = new Date().toISOString();
    update((current) => {
      const next = {
        ...current,
        tasks: moveTask(current.tasks, id, bucket, nowIso),
        pet: {
          ...current.pet,
          activeCoDoTaskId: current.pet.activeCoDoTaskId === id ? undefined : current.pet.activeCoDoTaskId,
          coDoStartedAt: current.pet.activeCoDoTaskId === id ? undefined : current.pet.coDoStartedAt,
          lastGrowthEvent: undefined,
          lastMessage: bucket === "tomorrow" ? "交给明天。" : "今天继续。"
        }
      };

      return maybeCompleteReviewIfCleared(next);
    });
  }

  function renameTaskById(id: string, title: string): void {
    const trimmed = title.trim();
    if (!trimmed) return;

    const nowIso = new Date().toISOString();
    update((current) => ({
      ...current,
      tasks: renameTask(current.tasks, id, trimmed, nowIso),
      pet: {
        ...current.pet,
        lastGrowthEvent: undefined,
        lastMessage: "这件事改好了。"
      }
    }));
  }

  function abandonTaskById(id: string): void {
    const nowIso = new Date().toISOString();
    update((current) => {
      const next = {
        ...current,
        tasks: abandonTask(current.tasks, id, nowIso),
        pet: {
          ...current.pet,
          activeCoDoTaskId: current.pet.activeCoDoTaskId === id ? undefined : current.pet.activeCoDoTaskId,
          coDoStartedAt: current.pet.activeCoDoTaskId === id ? undefined : current.pet.coDoStartedAt,
          lastGrowthEvent: undefined,
          lastMessage: "这件事已经放下。"
        }
      };

      return maybeCompleteReviewIfCleared(next);
    });
  }

  function setPanelMode(mode: PanelMode): void {
    update((current) => ({
      ...current,
      panel: {
        ...current.panel,
        mode
      }
    }));
  }

  function setPanelOpen(open: boolean): void {
    update((current) => ({
      ...current,
      pet: {
        ...current.pet,
        panelOpen: open,
        lastGrowthEvent: undefined,
        lastMessage: open ? "我回来了。" : "我在角落。"
      },
      panel: {
        ...current.panel,
        open
      }
    }));
  }

  function togglePanel(): void {
    setPanelOpen(!data.panel.open);
  }

  function startEveningReview(): void {
    if (openTodayTasks(data.tasks).length === 0) {
      finishEveningReview(eveningReviewCopy.empty);
      return;
    }

    update((current) => ({
      ...current,
      panel: {
        ...current.panel,
        open: true,
        mode: "eveningReview"
      },
      pet: {
        ...current.pet,
        panelOpen: true,
        mood: "evening",
        lastGrowthEvent: undefined,
        lastMessage: "今天还有一点点。"
      }
    }));
  }

  function closeEveningReview(): void {
    update((current) => ({
      ...current,
      panel: {
        ...current.panel,
        mode: "tasks"
      },
      pet: {
        ...current.pet,
        lastGrowthEvent: undefined,
        lastMessage: eveningReviewCopy.quiet
      }
    }));
  }

  function finishEveningReview(message: string = eveningReviewCopy.done): void {
    const localDate = toLocalDateKey(new Date());
    update((current) => completeEveningReviewState(current, { localDate, message }));

    scheduleBaseMoodReset();
  }

  function moveAllOpenTodayToTomorrow(): void {
    catchTodayTasksForTomorrow();
  }

  function catchTodayTasksForTomorrow(): void {
    const nowIso = new Date().toISOString();
    const localDate = toLocalDateKey(new Date());
    update((current) => {
      const openTodayCount = openTodayTasks(current.tasks).length;
      const nextGrowth =
        openTodayCount > 0
          ? withGrowthStage({
              ...current.growth,
              tomorrowCatchCount: current.growth.tomorrowCatchCount + 1
            })
          : current.growth;

      return completeEveningReviewState(
        {
          ...current,
          tasks: moveOpenTodayTasksToTomorrow(current.tasks, nowIso),
          growth: nextGrowth
        },
        {
          localDate,
          message: "我接住了，明天还在。",
          growthEventType: "catchTomorrow",
          previousGrowth: current.growth
        }
      );
    });
    scheduleBaseMoodReset();
  }

  function setPetPosition(position: PetPosition): void {
    update((current) => ({
      ...current,
      pet: {
        ...current.pet,
        position
      }
    }));
  }

  function setPetThemeId(themeId: PetThemeId): void {
    update((current) => ({
      ...current,
      settings: {
        ...current.settings,
        petThemeId: themeId
      }
    }));
  }

  function setGlowIntensity(intensity: GlowIntensity): void {
    update((current) => ({
      ...current,
      settings: {
        ...current.settings,
        glowIntensity: intensity
      }
    }));
  }

  function setCatchTomorrowEnabled(enabled: boolean): void {
    update((current) => ({
      ...current,
      settings: {
        ...current.settings,
        catchTomorrowEnabled: enabled
      },
      pet: {
        ...current.pet,
        lastGrowthEvent: undefined,
        lastMessage: enabled ? "我可以接住明天。" : "今天先留在这里。"
      }
    }));
  }

  function setGentleRemindersEnabled(enabled: boolean): void {
    update((current) => ({
      ...current,
      settings: {
        ...current.settings,
        gentleRemindersEnabled: enabled
      },
      pet: {
        ...current.pet,
        lastGrowthEvent: undefined,
        lastMessage: enabled ? "我会轻轻提醒。" : "我会更安静。"
      }
    }));
  }

  function setHoverInteractionEnabled(enabled: boolean): void {
    update((current) => ({
      ...current,
      settings: {
        ...current.settings,
        hoverInteractionEnabled: enabled
      }
    }));
  }

  function setQuietMode(mode: QuietModeId): void {
    update((current) => ({
      ...current,
      settings: {
        ...current.settings,
        quietMode: {
          mode,
          until: quietModeUntil(mode)
        }
      },
      pet: {
        ...current.pet,
        lastGrowthEvent: undefined,
        lastMessage: mode === "off" ? "我又轻轻亮起来了。" : "我会安静陪着。"
      }
    }));
  }

  function setDesktopPlacement(placement: DesktopPlacementId): void {
    update((current) => ({
      ...current,
      settings: {
        ...current.settings,
        desktopPlacement: placement
      }
    }));
  }

  function startCoDoTask(id: string): void {
    const nowIso = new Date().toISOString();
    update((current) => {
      const task = current.tasks.find((item) => item.id === id);
      if (!task || task.status !== "open") return current;

      const nextGrowth = withGrowthStage({
        ...current.growth,
        coDoSessionCount:
          current.pet.activeCoDoTaskId === id
            ? current.growth.coDoSessionCount
            : current.growth.coDoSessionCount + 1
      });
      const growthEvent =
        current.pet.activeCoDoTaskId === id ? undefined : createGrowthEvent(current.growth, nextGrowth, "coDo");
      const message = "我陪你做这件。";

      return {
        ...current,
        growth: nextGrowth,
        pet: {
          ...current.pet,
          activeCoDoTaskId: id,
          coDoStartedAt: nowIso,
          lastGrowthEvent: growthEvent,
          lastMessage: growthEvent ? growthMessageForStage(growthEvent, message) : message
        }
      };
    });
  }

  function stopCoDoTask(): void {
    update((current) => ({
      ...current,
      pet: {
        ...current.pet,
        activeCoDoTaskId: undefined,
        coDoStartedAt: undefined,
        lastGrowthEvent: undefined,
        lastMessage: "先停在这里也可以。"
      }
    }));
  }

  function markGentleReminderShown(message: string): void {
    const nowIso = new Date().toISOString();
    update((current) => ({
      ...current,
      pet: {
        ...current.pet,
        lastGentleReminderAt: nowIso,
        lastGentleReminderMessage: message
      }
    }));
  }

  return {
    data,
    todayOpenCount,
    tomorrowOpenCount,
    displayMood,
    isEvening,
    quietModeActive,
    gentleReminderMessage,
    gentleReminderActive,
    activeCoDoTask,
    ...model,
    addTaskToBucket,
    toggleTask,
    moveTaskToBucket,
    renameTaskById,
    abandonTaskById,
    startEveningReview,
    closeEveningReview,
    moveAllOpenTodayToTomorrow,
    finishEveningReview,
    setPanelMode,
    togglePanel,
    setPanelOpen,
    setPetPosition,
    setPetThemeId,
    setGlowIntensity,
    setCatchTomorrowEnabled,
    setGentleRemindersEnabled,
    setHoverInteractionEnabled,
    setQuietMode,
    setDesktopPlacement,
    startCoDoTask,
    stopCoDoTask,
    catchTodayTasksForTomorrow,
    markGentleReminderShown,
    showMessage
  };
}
