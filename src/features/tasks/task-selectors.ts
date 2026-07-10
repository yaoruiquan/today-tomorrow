import type { Task, TaskBucket } from "./task-types";

export function tasksInBucket(tasks: Task[], bucket: TaskBucket): Task[] {
  return tasks.filter((task) => task.bucket === bucket && (task.status === "open" || task.status === "done"));
}

export function openTaskCount(tasks: Task[], bucket: TaskBucket): number {
  return tasks.filter((task) => task.bucket === bucket && task.status === "open").length;
}

export function historyTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => task.status === "archived" || task.status === "abandoned")
    .sort((left, right) => taskHistoryTime(right) - taskHistoryTime(left));
}

function taskHistoryTime(task: Task): number {
  const value = task.abandonedAt ?? task.archivedAt ?? task.completedAt ?? task.updatedAt ?? task.createdAt;
  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}
