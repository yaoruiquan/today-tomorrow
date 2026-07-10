import { describe, expect, it } from "vitest";
import { rolloverTomorrowIntoToday } from "./day-rollover";
import { toLocalDateKey } from "./local-date";
import type { Task } from "../tasks/task-types";

const tomorrowTask: Task = {
  id: "task-1",
  title: "明天接住",
  bucket: "tomorrow",
  status: "open",
  createdAt: "2026-07-03T10:00:00.000Z",
  updatedAt: "2026-07-03T10:00:00.000Z"
};

const todayTask: Task = {
  id: "task-2",
  title: "昨天留在今天",
  bucket: "today",
  status: "open",
  createdAt: "2026-07-03T09:00:00.000Z",
  updatedAt: "2026-07-03T09:00:00.000Z"
};

describe("day rollover", () => {
  it("moves open tomorrow tasks into today after the date changes", () => {
    const result = rolloverTomorrowIntoToday({
      tasks: [tomorrowTask],
      lastOpenedLocalDate: "2026-07-03",
      currentLocalDate: "2026-07-04",
      now: "2026-07-04T09:00:00.000Z"
    });

    expect(result.tasks[0]).toMatchObject({
      bucket: "today",
      carriedFromDate: "2026-07-03"
    });
    expect(result.changed).toBe(true);
  });

  it("does not roll over twice on the same local date", () => {
    const result = rolloverTomorrowIntoToday({
      tasks: [tomorrowTask],
      lastOpenedLocalDate: "2026-07-03",
      currentLocalDate: "2026-07-03",
      now: "2026-07-03T11:00:00.000Z"
    });

    expect(result.tasks[0].bucket).toBe("tomorrow");
    expect(result.changed).toBe(false);
  });

  it("archives completed tomorrow tasks instead of showing them in the new day", () => {
    const result = rolloverTomorrowIntoToday({
      tasks: [{ ...tomorrowTask, status: "done" }],
      lastOpenedLocalDate: "2026-07-03",
      currentLocalDate: "2026-07-04",
      now: "2026-07-04T09:00:00.000Z"
    });

    expect(result.tasks[0].bucket).toBe("tomorrow");
    expect(result.tasks[0].status).toBe("archived");
    expect(result.tasks[0].archivedFromDate).toBe("2026-07-03");
  });

  it("archives yesterday today tasks when the date changes", () => {
    const result = rolloverTomorrowIntoToday({
      tasks: [todayTask, tomorrowTask],
      lastOpenedLocalDate: "2026-07-03",
      currentLocalDate: "2026-07-04",
      now: "2026-07-04T09:00:00.000Z"
    });

    expect(result.tasks[0]).toMatchObject({
      bucket: "today",
      status: "archived",
      archivedAt: "2026-07-04T09:00:00.000Z",
      archivedFromDate: "2026-07-03"
    });
    expect(result.tasks[1]).toMatchObject({
      bucket: "today",
      status: "open",
      carriedFromDate: "2026-07-03"
    });
  });

  it("archives stale today tasks even if older data already marked the app opened today", () => {
    const result = rolloverTomorrowIntoToday({
      tasks: [todayTask],
      lastOpenedLocalDate: "2026-07-04",
      currentLocalDate: "2026-07-04",
      now: "2026-07-04T09:00:00.000Z"
    });

    expect(result.changed).toBe(true);
    expect(result.tasks[0]).toMatchObject({
      status: "archived",
      archivedFromDate: "2026-07-03"
    });
  });

  it("keeps current-day today tasks visible", () => {
    const currentTask: Task = {
      ...todayTask,
      createdAt: "2026-07-04T08:00:00.000Z",
      updatedAt: "2026-07-04T08:00:00.000Z"
    };
    const result = rolloverTomorrowIntoToday({
      tasks: [currentTask],
      lastOpenedLocalDate: "2026-07-04",
      currentLocalDate: "2026-07-04",
      now: "2026-07-04T09:00:00.000Z"
    });

    expect(result.changed).toBe(false);
    expect(result.tasks[0].status).toBe("open");
  });

  it("formats local date keys without using UTC day boundaries", () => {
    const date = new Date(2026, 6, 3, 8, 30);

    expect(toLocalDateKey(date)).toBe("2026-07-03");
  });
});
