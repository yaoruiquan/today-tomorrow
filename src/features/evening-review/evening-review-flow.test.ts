import { describe, expect, it } from "vitest";
import { hasCompletedEveningReview, moveOpenTodayTasksToTomorrow, openTodayTasks } from "./evening-review-flow";
import type { Task } from "../tasks/task-types";

const openTodayTask: Task = {
  id: "task-1",
  title: "收尾",
  bucket: "today",
  status: "open",
  createdAt: "2026-07-03T10:00:00.000Z",
  updatedAt: "2026-07-03T10:00:00.000Z"
};

describe("evening review flow", () => {
  it("moves open today tasks to tomorrow", () => {
    const tasks = moveOpenTodayTasksToTomorrow([openTodayTask], "2026-07-03T18:00:00.000Z");

    expect(tasks[0].bucket).toBe("tomorrow");
    expect(tasks[0].status).toBe("open");
  });

  it("returns only open today tasks", () => {
    const tasks = openTodayTasks([
      openTodayTask,
      { ...openTodayTask, id: "task-2", bucket: "tomorrow" },
      { ...openTodayTask, id: "task-3", status: "done" }
    ]);

    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe("task-1");
  });

  it("detects whether today's review is complete", () => {
    expect(hasCompletedEveningReview("2026-07-03", "2026-07-03")).toBe(true);
    expect(hasCompletedEveningReview("2026-07-03", "2026-07-02")).toBe(false);
  });
});
