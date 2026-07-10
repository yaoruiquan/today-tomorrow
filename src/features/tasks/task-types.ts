export type TaskBucket = "today" | "tomorrow";

export type TaskStatus = "open" | "done" | "abandoned" | "archived";

export interface Task {
  id: string;
  title: string;
  bucket: TaskBucket;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  abandonedAt?: string;
  archivedAt?: string;
  archivedFromDate?: string;
  carriedFromDate?: string;
}
