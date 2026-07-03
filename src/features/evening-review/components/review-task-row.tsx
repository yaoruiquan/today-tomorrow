import type { Task } from "../../tasks/task-types";

interface ReviewTaskRowProps {
  task: Task;
  onComplete: (id: string) => void;
  onMoveTomorrow: (id: string) => void;
  onAbandon: (id: string) => void;
}

export function ReviewTaskRow({
  task,
  onComplete,
  onMoveTomorrow,
  onAbandon
}: ReviewTaskRowProps) {
  return (
    <li className="review-task-row">
      <span>{task.title}</span>
      <div className="review-row-actions">
        <button type="button" className="icon-action" aria-label="标记完成" onClick={() => onComplete(task.id)}>
          ✓
        </button>
        <button
          type="button"
          className="icon-action"
          aria-label="移到明天"
          onClick={() => onMoveTomorrow(task.id)}
        >
          →
        </button>
        <button type="button" className="icon-action" aria-label="放弃这件事" onClick={() => onAbandon(task.id)}>
          ×
        </button>
      </div>
    </li>
  );
}
