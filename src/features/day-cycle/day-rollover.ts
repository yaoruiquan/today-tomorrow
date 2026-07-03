import type { Task } from "../tasks/task-types";

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
  if (input.currentLocalDate === input.lastOpenedLocalDate) {
    return { tasks: input.tasks, changed: false };
  }

  return {
    changed: true,
    tasks: input.tasks.map((task) => {
      if (task.bucket !== "tomorrow" || task.status !== "open") {
        return task;
      }

      return {
        ...task,
        bucket: "today",
        carriedFromDate: input.lastOpenedLocalDate,
        updatedAt: input.now
      };
    })
  };
}
