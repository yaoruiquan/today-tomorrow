import { taskCopy } from "../task-copy";
import type { Task, TaskBucket } from "../task-types";
import { ColumnAdd } from "./column-add";
import { TaskItem } from "./task-item";

const MAX_VISIBLE_OPEN_TASKS = 4;

interface TaskColumnProps {
  bucket: TaskBucket;
  title: string;
  subtitle?: string;
  variant?: "focus" | "shelf";
  openCount: number;
  tasks: Task[];
  activeCoDoTaskId?: string;
  receiving?: boolean;
  onAdd: (title: string, bucket: TaskBucket) => void;
  onEmptySubmit: (bucket: TaskBucket) => void;
  onToggle: (id: string) => void;
  onMove: (id: string, bucket: TaskBucket) => void;
  onStartCoDo: (id: string) => void;
  onStopCoDo: () => void;
}

export function TaskColumn({
  bucket,
  title,
  subtitle,
  variant = "focus",
  openCount,
  tasks,
  activeCoDoTaskId,
  receiving = false,
  onAdd,
  onEmptySubmit,
  onToggle,
  onMove,
  onStartCoDo,
  onStopCoDo
}: TaskColumnProps) {
  const openTasks = tasks.filter((task) => task.status === "open");
  const completedTasks = tasks.filter((task) => task.status === "done");
  const visibleOpenTasks = openTasks.slice(0, MAX_VISIBLE_OPEN_TASKS);
  const remainingSlots = Math.max(MAX_VISIBLE_OPEN_TASKS - visibleOpenTasks.length, 0);
  const visibleCompletedTasks = completedTasks.slice(0, remainingSlots);
  const visibleTasks = [...visibleOpenTasks, ...visibleCompletedTasks];
  const hiddenOpenCount = Math.max(openTasks.length - visibleOpenTasks.length, 0);
  const hiddenCompletedCount = Math.max(completedTasks.length - visibleCompletedTasks.length, 0);

  return (
    <section
      className={`task-column task-column-${variant}`}
      data-receiving={receiving ? "true" : undefined}
      aria-labelledby={`${bucket}-title`}
    >
      <div className="column-head">
        <div>
          <h3 id={`${bucket}-title`}>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <span className="counter" aria-label={`${title}未完成${openCount}件`}>
          {openCount}
        </span>
      </div>
      <ColumnAdd
        bucket={bucket}
        placeholder={bucket === "today" ? "添加今天的事" : "放到明天"}
        inputLabel={bucket === "today" ? "添加今天的任务" : "添加明天的任务"}
        buttonLabel={bucket === "today" ? "添加到今天" : "添加到明天"}
        autoFocusTarget={bucket === "today"}
        onAdd={onAdd}
        onEmptySubmit={onEmptySubmit}
      />
      <ul className="task-list">
        {visibleTasks.length ? (
          <>
            {visibleTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isCoDoing={activeCoDoTaskId === task.id}
                onToggle={onToggle}
                onMove={onMove}
                onStartCoDo={onStartCoDo}
                onStopCoDo={onStopCoDo}
              />
            ))}
            {hiddenOpenCount ? (
              <li className="overflow-row">
                {bucket === "today"
                  ? `还有 ${hiddenOpenCount} 件，先放在后面`
                  : `明天还放着 ${hiddenOpenCount} 件`}
              </li>
            ) : null}
            {!hiddenOpenCount && hiddenCompletedCount ? (
              <li className="overflow-row">{`还有 ${hiddenCompletedCount} 件已完成`}</li>
            ) : null}
          </>
        ) : (
          <li className="empty">{bucket === "today" ? taskCopy.emptyToday : taskCopy.emptyTomorrow}</li>
        )}
      </ul>
    </section>
  );
}
