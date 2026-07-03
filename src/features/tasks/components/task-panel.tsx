import type { AppModelSnapshot } from "./task-panel-types";
import { EveningReviewDialog } from "../../evening-review/components/evening-review-dialog";
import type { TaskBucket } from "../task-types";
import { QuickAdd } from "./quick-add";
import { TaskColumn } from "./task-column";

interface TaskPanelProps {
  model: AppModelSnapshot;
  compact?: boolean;
}

export function TaskPanel({ model, compact = false }: TaskPanelProps) {
  const dateLabel = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(new Date());

  if (model.data.panel.mode === "eveningReview") {
    return (
      <article className={`task-panel${compact ? " is-compact" : ""}`}>
        <EveningReviewDialog
          tasks={model.reviewTasks}
          onKeep={model.closeEveningReview}
          onMoveAll={model.moveAllOpenTodayToTomorrow}
          onCompleteTask={model.toggleTask}
          onMoveTask={(id) => model.moveTaskToBucket(id, "tomorrow")}
          onAbandonTask={model.abandonTaskById}
        />
      </article>
    );
  }

  return (
    <article className={`task-panel${compact ? " is-compact" : ""}`} aria-label="今天和明天">
      <div className="panel-head">
        <div>
          <p className="panel-kicker">{dateLabel}</p>
          <h1>今天 / 明天</h1>
        </div>
        <button className="quiet-button" type="button" onClick={model.startEveningReview}>
          下班整理
        </button>
      </div>

      <QuickAdd onAdd={model.addTaskToBucket} />

      <div className="columns">
        <TaskColumn
          bucket="today"
          title="今天"
          openCount={model.todayOpenCount}
          tasks={model.todayTasks}
          onToggle={model.toggleTask}
          onMove={(id: string, bucket: TaskBucket) => model.moveTaskToBucket(id, bucket)}
        />
        <TaskColumn
          bucket="tomorrow"
          title="明天"
          openCount={model.tomorrowOpenCount}
          tasks={model.tomorrowTasks}
          onToggle={model.toggleTask}
          onMove={(id: string, bucket: TaskBucket) => model.moveTaskToBucket(id, bucket)}
        />
      </div>
    </article>
  );
}
