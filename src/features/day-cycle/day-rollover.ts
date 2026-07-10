import type { Task } from "../tasks/task-types";
import { toLocalDateKey } from "./local-date";

interface RolloverInput {
  tasks: Task[];
  lastOpenedLocalDate: string;
  currentLocalDate: string;
  now: string;
}

interface RolloverResult {
  tasks: Task[];
  changed: boolean;
}

export function rolloverTomorrowIntoToday(input: RolloverInput): RolloverResult {
  const dateChanged = input.currentLocalDate !== input.lastOpenedLocalDate;
  let changed = dateChanged;

  const tasks = input.tasks.map((task) => {
    if (task.status === "abandoned" || task.status === "archived") return task;

    const activeDate = taskActiveLocalDate(task);

    if (shouldArchiveStaleTodayTask(task, input.currentLocalDate, activeDate)) {
      changed = true;
      return archiveTaskForHistory(task, activeDate || input.lastOpenedLocalDate, input.now);
    }

    if (!dateChanged) return task;

    if (task.bucket === "today") {
      return archiveTaskForHistory(task, input.lastOpenedLocalDate, input.now);
    }

    if (task.bucket === "tomorrow" && task.status === "open") {
      return {
        ...task,
        bucket: "today" as const,
        carriedFromDate: input.lastOpenedLocalDate,
        updatedAt: input.now
      };
    }

    return archiveTaskForHistory(task, input.lastOpenedLocalDate, input.now);
  });

  return { tasks, changed };
}

function archiveTaskForHistory(task: Task, archivedFromDate: string, now: string): Task {
  return {
    ...task,
    status: "archived",
    archivedAt: now,
    archivedFromDate,
    updatedAt: now
  };
}

function shouldArchiveStaleTodayTask(task: Task, currentLocalDate: string, activeDate = taskActiveLocalDate(task)): boolean {
  if (task.bucket !== "today" || (task.status !== "open" && task.status !== "done")) return false;

  return activeDate < currentLocalDate;
}

function taskActiveLocalDate(task: Task): string {
  return toTaskLocalDateKey(task.completedAt ?? task.updatedAt ?? task.createdAt);
}

function toTaskLocalDateKey(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return toLocalDateKey(date);
}
