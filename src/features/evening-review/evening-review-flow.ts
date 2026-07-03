import type { Task } from "../tasks/task-types";

export function moveOpenTodayTasksToTomorrow(tasks: Task[], now: string): Task[] {
  return tasks.map((task) => {
    if (task.bucket !== "today" || task.status !== "open") return task;

    return {
      ...task,
      bucket: "tomorrow",
      updatedAt: now
    };
  });
}

export function openTodayTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.bucket === "today" && task.status === "open");
}

export function hasCompletedEveningReview(date: string, lastEveningReviewDate?: string): boolean {
  return date === lastEveningReviewDate;
}
