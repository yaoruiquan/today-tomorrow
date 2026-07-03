import React from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { clearAppData, loadAppData, saveAppData } from "./app-storage";
import { completeEveningReviewState, useAppModel } from "./app-model";
import { createDefaultAppData } from "./default-app-data";

describe("app storage", () => {
  beforeEach(() => {
    clearAppData();
  });

  it("starts with default app data", () => {
    const data = createDefaultAppData("2026-07-03");

    expect(data.tasks).toEqual([]);
    expect(data.settings.workdayEndTime).toBe("18:00");
    expect(data.dayCycle.lastOpenedLocalDate).toBe("2026-07-03");
    expect(data.pet.panelOpen).toBe(false);
    expect(data.panel.open).toBe(false);
    expect(data.growth.stage).toBe("spark");
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
  });

  it("finishes review when the last open today task is handled one by one", () => {
    render(React.createElement(ModelProbe));

    act(() => readModel().addTaskToBucket("逐项收尾", "today"));
    act(() => readModel().startEveningReview());

    const taskId = readModel().reviewTasks[0].id;
    act(() => readModel().moveTaskToBucket(taskId, "tomorrow"));

    expect(readModel().data.panel.mode).toBe("tasks");
    expect(readModel().data.growth.eveningReviewCount).toBe(1);
    expect(readModel().data.pet.lastMessage).toBe("今天可以收起来了。");
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
});
