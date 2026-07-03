export type TaskBucket = "today" | "tomorrow";

export type TaskStatus = "open" | "done" | "abandoned";

export interface Task {
  id: string;
  title: string;
  bucket: TaskBucket;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  abandonedAt?: string;
  carriedFromDate?: string;
}
