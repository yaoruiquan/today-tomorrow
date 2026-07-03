import type { Task, TaskBucket } from "./task-types";

export function tasksInBucket(tasks: Task[], bucket: TaskBucket): Task[] {
  return tasks.filter((task) => task.bucket === bucket && task.status !== "abandoned");
}

export function openTaskCount(tasks: Task[], bucket: TaskBucket): number {
  return tasks.filter((task) => task.bucket === bucket && task.status === "open").length;
}
