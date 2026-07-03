import { eveningReviewCopy, reviewTitle } from "../evening-review-copy";
import type { Task } from "../../tasks/task-types";
import { ReviewTaskRow } from "./review-task-row";

interface EveningReviewDialogProps {
  tasks: Task[];
  onKeep: () => void;
  onMoveAll: () => void;
  onCompleteTask: (id: string) => void;
  onMoveTask: (id: string) => void;
  onAbandonTask: (id: string) => void;
}

export function EveningReviewDialog({
  tasks,
  onKeep,
  onMoveAll,
  onCompleteTask,
  onMoveTask,
  onAbandonTask
}: EveningReviewDialogProps) {
  return (
    <section className="review-panel" aria-labelledby="review-title">
      <p className="panel-kicker">收尾</p>
      <h2 id="review-title">{reviewTitle(tasks.length)}</h2>
      <p className="review-copy">
        {tasks.length ? "可以一件件放好，也可以让明天先接住它们。" : eveningReviewCopy.empty}
      </p>

      {tasks.length ? (
        <ul className="review-task-list">
          {tasks.map((task) => (
            <ReviewTaskRow
              key={task.id}
              task={task}
              onComplete={onCompleteTask}
              onMoveTomorrow={onMoveTask}
              onAbandon={onAbandonTask}
            />
          ))}
        </ul>
      ) : null}

      <div className="review-actions">
        <button className="quiet-button" type="button" onClick={onKeep}>
          {eveningReviewCopy.keep}
        </button>
        {tasks.length ? (
          <button className="primary-button" type="button" onClick={onMoveAll}>
            {eveningReviewCopy.moveAll}
          </button>
        ) : null}
      </div>
    </section>
  );
}
