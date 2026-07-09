import React from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { clearAppData, loadAppData, saveAppData } from "./app-storage";
import { completeEveningReviewState, getGentleReminderCandidate, useAppModel } from "./app-model";
import { createDefaultAppData } from "./default-app-data";

describe("app storage", () => {
  beforeEach(() => {
    clearAppData();
  });

  it("starts with default app data", () => {
    const data = createDefaultAppData("2026-07-03");

    expect(data.tasks).toEqual([]);
    expect(data.settings.workdayEndTime).toBe("18:00");
    expect(data.settings.petThemeId).toBe("warmGlow");
    expect(data.settings.glowIntensity).toBe("soft");
    expect(data.settings.catchTomorrowEnabled).toBe(true);
    expect(data.settings.gentleRemindersEnabled).toBe(true);
    expect(data.settings.hoverInteractionEnabled).toBe(true);
    expect(data.settings.quietMode.mode).toBe("off");
    expect(data.dayCycle.lastOpenedLocalDate).toBe("2026-07-03");
    expect(data.pet.panelOpen).toBe(false);
    expect(data.panel.open).toBe(false);
    expect(data.growth.stage).toBe("seedLight");
  });

  it("normalizes persisted panel state to closed on load", () => {
    const data = createDefaultAppData("2026-07-03");
    saveAppData({
      ...data,
      pet: { ...data.pet, panelOpen: true },
      panel: { ...data.panel, open: true }
    });

    const loaded = loadAppData(createDefaultAppData("2026-07-03"));

    expect(loaded.pet.panelOpen).toBe(false);
    expect(loaded.panel.open).toBe(false);
  });

  it("does not restore transient pet messages on load", () => {
    const data = createDefaultAppData("2026-07-03");
    saveAppData({
      ...data,
      pet: { ...data.pet, lastMessage: "我回来了。" }
    });

    const loaded = loadAppData(createDefaultAppData("2026-07-03"));

    expect(loaded.pet.lastMessage).toBeUndefined();
  });

  it("does not restore transient growth events on load", () => {
    const data = createDefaultAppData("2026-07-03");
    saveAppData({
      ...data,
      pet: {
        ...data.pet,
        lastGrowthEvent: {
          id: "growth-1",
          type: "catchTomorrow",
          at: "2026-07-03T10:00:00.000Z",
          stageBefore: "seedLight",
          stageAfter: "smallGlow",
          stageChanged: true
        }
      }
    });

    const loaded = loadAppData(createDefaultAppData("2026-07-03"));

    expect(loaded.pet.lastGrowthEvent).toBeUndefined();
  });

  it("normalizes legacy growth stage names on load", () => {
    const data = createDefaultAppData("2026-07-03");
    saveAppData({
      ...data,
      growth: { ...data.growth, stage: "halo" as never }
    });

    const loaded = loadAppData(createDefaultAppData("2026-07-03"));

    expect(loaded.growth.stage).toBe("holdingGlow");
  });
});

describe("app model", () => {
  let model: ReturnType<typeof useAppModel> | undefined;

  function readModel(): ReturnType<typeof useAppModel> {
    if (!model) throw new Error("model probe did not render");
    return model;
  }

  function ModelProbe() {
    model = useAppModel();
    return React.createElement("div");
  }

  beforeEach(() => {
    clearAppData();
    model = undefined;
  });

  it("moves all open today tasks to tomorrow and records review atomically", () => {
    render(React.createElement(ModelProbe));

    act(() => readModel().addTaskToBucket("整理交接", "today"));
    act(() => readModel().startEveningReview());
    act(() => readModel().moveAllOpenTodayToTomorrow());

    expect(readModel().todayOpenCount).toBe(0);
    expect(readModel().tomorrowOpenCount).toBe(1);
    expect(readModel().tomorrowTasks[0]).toMatchObject({
      title: "整理交接",
      bucket: "tomorrow",
      status: "open"
    });
    expect(readModel().data.panel.mode).toBe("tasks");
    expect(readModel().data.growth.eveningReviewCount).toBe(1);
    expect(readModel().data.pet.lastGrowthEvent).toMatchObject({
      type: "catchTomorrow",
      stageBefore: "seedLight",
      stageAfter: "starCore",
      stageChanged: true
    });
  });

  it("finishes review with milestone copy when the last open today task advances growth", () => {
    render(React.createElement(ModelProbe));

    act(() => readModel().addTaskToBucket("逐项收尾", "today"));
    act(() => readModel().startEveningReview());

    const taskId = readModel().reviewTasks[0].id;
    act(() => readModel().moveTaskToBucket(taskId, "tomorrow"));

    expect(readModel().data.panel.mode).toBe("tasks");
    expect(readModel().data.growth.eveningReviewCount).toBe(1);
    expect(readModel().data.pet.lastMessage).toBe("小光团好像长大了一点。");
    expect(readModel().data.pet.lastGrowthEvent).toMatchObject({
      type: "eveningReview",
      stageBefore: "seedLight",
      stageAfter: "smallGlow",
      stageChanged: true
    });
  });

  it("does not count the same local date review twice", () => {
    const data = createDefaultAppData("2026-07-03");

    const firstReview = completeEveningReviewState(data, {
      localDate: "2026-07-03",
      message: "今天可以收起来了。"
    });
    const secondReview = completeEveningReviewState(firstReview, {
      localDate: "2026-07-03",
      message: "今天可以收起来了。"
    });

    expect(secondReview.growth.eveningReviewCount).toBe(1);
    expect(secondReview.growth.eveningReviewStreak).toBe(1);
  });

  it("updates theme and glow preferences without changing tasks", () => {
    render(React.createElement(ModelProbe));

    act(() => readModel().addTaskToBucket("保留任务", "today"));
    const taskId = readModel().todayTasks[0].id;

    act(() => readModel().setPetThemeId("blueNight"));
    act(() => readModel().setGlowIntensity("bright"));

    expect(readModel().data.settings.petThemeId).toBe("blueNight");
    expect(readModel().data.settings.glowIntensity).toBe("bright");
    expect(readModel().todayTasks).toHaveLength(1);
    expect(readModel().todayTasks[0]).toMatchObject({
      id: taskId,
      title: "保留任务",
      bucket: "today",
      status: "open"
    });
  });

  it("does not catch today tasks until the user confirms", () => {
    render(React.createElement(ModelProbe));

    act(() => readModel().addTaskToBucket("需要被接住", "today"));
    act(() => readModel().setCatchTomorrowEnabled(false));

    expect(readModel().todayOpenCount).toBe(1);
    expect(readModel().tomorrowOpenCount).toBe(0);

    act(() => readModel().setCatchTomorrowEnabled(true));

    expect(readModel().todayOpenCount).toBe(1);
    expect(readModel().tomorrowOpenCount).toBe(0);

    act(() => readModel().catchTodayTasksForTomorrow());

    expect(readModel().todayOpenCount).toBe(0);
    expect(readModel().tomorrowOpenCount).toBe(1);
    expect(readModel().data.growth.tomorrowCatchCount).toBe(1);
    expect(readModel().data.pet.lastGrowthEvent).toMatchObject({
      type: "catchTomorrow"
    });
    expect(readModel().data.pet.lastMessage).toBe("身体里多了一点星尘光。");
  });

  it("records explicit growth events instead of relying on pet message text", () => {
    render(React.createElement(ModelProbe));

    act(() => readModel().addTaskToBucket("第一件", "today"));
    expect(readModel().data.pet.lastGrowthEvent).toMatchObject({
      type: "recordToday",
      stageBefore: "seedLight",
      stageAfter: "seedLight",
      stageChanged: false
    });

    const taskId = readModel().todayTasks[0].id;
    act(() => readModel().toggleTask(taskId));

    expect(readModel().data.pet.lastGrowthEvent).toMatchObject({
      type: "completeTask",
      stageBefore: "seedLight",
      stageAfter: "smallGlow",
      stageChanged: true
    });
    expect(readModel().data.pet.lastMessage).toBe("小光团好像长大了一点。");
  });

  it("keeps only one active co-do task and clears it on completion", () => {
    render(React.createElement(ModelProbe));

    act(() => readModel().addTaskToBucket("第一件", "today"));
    act(() => readModel().addTaskToBucket("第二件", "today"));

    const firstId = readModel().todayTasks[1].id;
    const secondId = readModel().todayTasks[0].id;

    act(() => readModel().startCoDoTask(firstId));
    expect(readModel().data.pet.activeCoDoTaskId).toBe(firstId);

    act(() => readModel().startCoDoTask(secondId));
    expect(readModel().data.pet.activeCoDoTaskId).toBe(secondId);

    act(() => readModel().toggleTask(secondId));
    expect(readModel().data.pet.activeCoDoTaskId).toBeUndefined();
  });

  it("suppresses gentle reminders while quiet mode is active", () => {
    const data = {
      ...createDefaultAppData("2026-07-03"),
      tasks: [
        {
          id: "task-1",
          title: "安静收尾",
          bucket: "today" as const,
          status: "open" as const,
          createdAt: "2026-07-03T08:00:00.000Z",
          updatedAt: "2026-07-03T08:00:00.000Z"
        }
      ]
    };
    const evening = new Date(2026, 6, 3, 19, 0);

    expect(getGentleReminderCandidate(data, evening, false)?.reason).toBe("eveningCatch");
    expect(getGentleReminderCandidate(data, evening, true)).toBeUndefined();
  });
});
