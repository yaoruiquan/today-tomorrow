import { describe, expect, it } from "vitest";
import { addTask, moveTask, toggleTaskDone } from "./task-reducer";
import { openTaskCount } from "./task-selectors";
import type { Task } from "./task-types";

const baseTask: Task = {
  id: "task-1",
  title: "整理今天",
  bucket: "today",
  status: "open",
  createdAt: "2026-07-03T10:00:00.000Z",
  updatedAt: "2026-07-03T10:00:00.000Z"
};

describe("task reducer", () => {
  it("adds a today task", () => {
    const tasks = addTask([], {
      id: "task-2",
      title: "写下一件事",
      bucket: "today",
      now: "2026-07-03T10:05:00.000Z"
    });

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      id: "task-2",
      title: "写下一件事",
      bucket: "today",
      status: "open"
    });
  });

  it("marks a task done", () => {
    const tasks = toggleTaskDone([baseTask], "task-1", "2026-07-03T10:10:00.000Z");

    expect(tasks[0].status).toBe("done");
    expect(tasks[0].completedAt).toBe("2026-07-03T10:10:00.000Z");
  });

  it("reopens a done task", () => {
    const doneTask: Task = {
      ...baseTask,
      status: "done",
      completedAt: "2026-07-03T10:10:00.000Z"
    };

    const tasks = toggleTaskDone([doneTask], "task-1", "2026-07-03T10:20:00.000Z");

    expect(tasks[0].status).toBe("open");
    expect(tasks[0].completedAt).toBeUndefined();
  });

  it("moves an open today task to tomorrow", () => {
    const tasks = moveTask([baseTask], "task-1", "tomorrow", "2026-07-03T10:15:00.000Z");

    expect(tasks[0].bucket).toBe("tomorrow");
    expect(tasks[0].status).toBe("open");
  });

  it("counts only open tasks in a bucket", () => {
    const doneTask: Task = { ...baseTask, id: "task-2", status: "done" };

    expect(openTaskCount([baseTask, doneTask], "today")).toBe(1);
  });
});
