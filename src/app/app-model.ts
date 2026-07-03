import { useEffect, useMemo, useRef, useState } from "react";
import { rolloverTomorrowIntoToday } from "../features/day-cycle/day-rollover";
import { toLocalDateKey } from "../features/day-cycle/local-date";
import {
  hasCompletedEveningReview,
  moveOpenTodayTasksToTomorrow,
  openTodayTasks
} from "../features/evening-review/evening-review-flow";
import { eveningReviewCopy } from "../features/evening-review/evening-review-copy";
import { getGrowthStage } from "../features/growth/growth-rules";
import { getBasePetMood, type PetMood } from "../features/pet/pet-mood";
import { isEveningByTime } from "../features/settings/settings-store";
import { abandonTask, addTask, moveTask, toggleTaskDone } from "../features/tasks/task-reducer";
import { openTaskCount, tasksInBucket } from "../features/tasks/task-selectors";
import type { TaskBucket } from "../features/tasks/task-types";
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
}

interface AppModel {
  data: AppData;
  todayOpenCount: number;
  tomorrowOpenCount: number;
  displayMood: PetMood;
  isEvening: boolean;
  todayTasks: ReturnType<typeof tasksInBucket>;
  tomorrowTasks: ReturnType<typeof tasksInBucket>;
  reviewTasks: ReturnType<typeof openTodayTasks>;
  addTaskToBucket: (title: string, bucket: TaskBucket) => void;
  toggleTask: (id: string) => void;
  moveTaskToBucket: (id: string, bucket: TaskBucket) => void;
  abandonTaskById: (id: string) => void;
  startEveningReview: () => void;
  closeEveningReview: () => void;
  moveAllOpenTodayToTomorrow: () => void;
  finishEveningReview: (message?: string) => void;
  setPanelMode: (mode: PanelMode) => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  setPetPosition: (position: PetPosition) => void;
  showMessage: (message: string, mood?: PetMood) => void;
}

interface PreparedAppData {
  data: AppData;
  changed: boolean;
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
    growth: {
      ...current.growth,
      eveningReviewCount: nextReviewCount,
      eveningReviewStreak: alreadyCompletedToday
        ? current.growth.eveningReviewStreak
        : current.growth.eveningReviewStreak + 1,
      stage: getGrowthStage(nextReviewCount)
    },
    pet: {
      ...current.pet,
      mood: "happy",
      lastMessage: input.message
    }
  };
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
    const loaded = loadAppData(createDefaultAppData(today));
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
  const todayOpenCount = openTaskCount(data.tasks, "today");
  const tomorrowOpenCount = openTaskCount(data.tasks, "tomorrow");
  const baseMood = getBasePetMood({ openTodayCount: todayOpenCount, isEvening });
  const displayMood = data.pet.mood === "happy" ? "happy" : baseMood;

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
    update((current) => ({
      ...current,
      tasks: addTask(current.tasks, {
        id: createId("task"),
        title: trimmed,
        bucket,
        now: nowIso
      }),
      pet: {
        ...current.pet,
        lastMessage: bucket === "today" ? "放进今天了。" : "明天会接住它。"
      }
    }));
  }

  function toggleTask(id: string): void {
    const task = data.tasks.find((item) => item.id === id);
    const willComplete = Boolean(task && task.status !== "done");
    const nowIso = new Date().toISOString();

    update((current) => {
      const nextGrowth = willComplete
        ? {
            ...current.growth,
            completedTaskCount: current.growth.completedTaskCount + 1
          }
        : current.growth;

      const next = {
        ...current,
        tasks: toggleTaskDone(current.tasks, id, nowIso),
        growth: nextGrowth,
        pet: {
          ...current.pet,
          mood: willComplete ? "happy" : current.pet.mood,
          lastMessage: willComplete ? "完成得很安静。" : "重新放回视线里。"
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
          lastMessage: bucket === "tomorrow" ? "交给明天。" : "今天继续。"
        }
      };

      return maybeCompleteReviewIfCleared(next);
    });
  }

  function abandonTaskById(id: string): void {
    const nowIso = new Date().toISOString();
    update((current) => {
      const next = {
        ...current,
        tasks: abandonTask(current.tasks, id, nowIso),
        pet: {
          ...current.pet,
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
    const nowIso = new Date().toISOString();
    const localDate = toLocalDateKey(new Date());
    update((current) =>
      completeEveningReviewState(
        {
          ...current,
          tasks: moveOpenTodayTasksToTomorrow(current.tasks, nowIso)
        },
        {
          localDate,
          message: "明天已经接住了。"
        }
      )
    );
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

  return {
    data,
    todayOpenCount,
    tomorrowOpenCount,
    displayMood,
    isEvening,
    ...model,
    addTaskToBucket,
    toggleTask,
    moveTaskToBucket,
    abandonTaskById,
    startEveningReview,
    closeEveningReview,
    moveAllOpenTodayToTomorrow,
    finishEveningReview,
    setPanelMode,
    togglePanel,
    setPanelOpen,
    setPetPosition,
    showMessage
  };
}
