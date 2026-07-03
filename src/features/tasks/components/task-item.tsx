import type { Task, TaskBucket } from "../task-types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onMove: (id: string, bucket: TaskBucket) => void;
}

export function TaskItem({ task, onToggle, onMove }: TaskItemProps) {
  const nextBucket: TaskBucket = task.bucket === "today" ? "tomorrow" : "today";
  const isDone = task.status === "done";

  return (
    <li className={`task-item${isDone ? " is-done" : ""}`}>
      <button
        className={`check-button${isDone ? " is-done" : ""}`}
        type="button"
        aria-label={isDone ? "标记未完成" : "完成任务"}
        onClick={() => onToggle(task.id)}
      >
        {isDone ? "✓" : ""}
      </button>
      <span className="task-title">{task.title}</span>
      <button
        className="move-button"
        type="button"
        aria-label={task.bucket === "today" ? "移到明天" : "移到今天"}
        onClick={() => onMove(task.id, nextBucket)}
      >
        {task.bucket === "today" ? "→" : "←"}
      </button>
    </li>
  );
}
