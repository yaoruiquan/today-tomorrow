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

  it("does not move completed tomorrow tasks", () => {
    const result = rolloverTomorrowIntoToday({
      tasks: [{ ...tomorrowTask, status: "done" }],
      lastOpenedLocalDate: "2026-07-03",
      currentLocalDate: "2026-07-04",
      now: "2026-07-04T09:00:00.000Z"
    });

    expect(result.tasks[0].bucket).toBe("tomorrow");
  });

  it("formats local date keys without using UTC day boundaries", () => {
    const date = new Date(2026, 6, 3, 8, 30);

    expect(toLocalDateKey(date)).toBe("2026-07-03");
  });
});
