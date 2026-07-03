import type { Task, TaskBucket } from "../task-types";

interface TaskItemProps {
  task: Task;
  isCoDoing?: boolean;
  onToggle: (id: string) => void;
  onMove: (id: string, bucket: TaskBucket) => void;
  onStartCoDo: (id: string) => void;
  onStopCoDo: () => void;
}

export function TaskItem({ task, isCoDoing = false, onToggle, onMove, onStartCoDo, onStopCoDo }: TaskItemProps) {
  const nextBucket: TaskBucket = task.bucket === "today" ? "tomorrow" : "today";
  const isDone = task.status === "done";

  return (
    <li className={`task-item${isDone ? " is-done" : ""}${isCoDoing ? " is-co-doing" : ""}`}>
      <button
        className={`check-button${isDone ? " is-done" : ""}`}
        type="button"
        aria-label={isDone ? "标记未完成" : "完成任务"}
        onClick={() => onToggle(task.id)}
      >
        {isDone ? "✓" : ""}
      </button>
      <span className="task-title-wrap">
        <span className="task-title">{task.title}</span>
        {isCoDoing ? <span className="co-do-chip">陪做中</span> : null}
      </span>
      {!isDone ? (
        <button
          className="co-do-button"
          type="button"
          aria-label={isCoDoing ? "停止陪做" : "陪我做这件"}
          aria-pressed={isCoDoing}
          onClick={() => (isCoDoing ? onStopCoDo() : onStartCoDo(task.id))}
        >
          {isCoDoing ? "停" : "陪做"}
        </button>
      ) : (
        <span className="co-do-spacer" aria-hidden="true" />
      )}
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
