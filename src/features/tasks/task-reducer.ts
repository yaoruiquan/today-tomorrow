import type { Task, TaskBucket } from "./task-types";

interface AddTaskInput {
  id: string;
  title: string;
  bucket: TaskBucket;
  now: string;
}

export function addTask(tasks: Task[], input: AddTaskInput): Task[] {
  return [
    {
      id: input.id,
      title: input.title,
      bucket: input.bucket,
      status: "open",
      createdAt: input.now,
      updatedAt: input.now
    },
    ...tasks
  ];
}

export function toggleTaskDone(tasks: Task[], id: string, now: string): Task[] {
  return tasks.map((task) => {
    if (task.id !== id) return task;

    if (task.status === "done") {
      const { completedAt: _completedAt, ...reopenedTask } = task;
      return {
        ...reopenedTask,
        status: "open",
        updatedAt: now
      };
    }

    return {
      ...task,
      status: "done",
      completedAt: now,
      updatedAt: now
    };
  });
}

export function moveTask(tasks: Task[], id: string, bucket: TaskBucket, now: string): Task[] {
  return tasks.map((task) => {
    if (task.id !== id) return task;

    const {
      completedAt: _completedAt,
      abandonedAt: _abandonedAt,
      ...activeTask
    } = task;

    return {
      ...activeTask,
      bucket,
      status: "open",
      updatedAt: now
    };
  });
}

export function abandonTask(tasks: Task[], id: string, now: string): Task[] {
  return tasks.map((task) => {
    if (task.id !== id) return task;

    const { completedAt: _completedAt, ...activeTask } = task;

    return {
      ...activeTask,
      status: "abandoned",
      abandonedAt: now,
      updatedAt: now
    };
  });
}
