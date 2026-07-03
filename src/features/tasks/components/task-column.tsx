import { taskCopy } from "../task-copy";
import type { Task, TaskBucket } from "../task-types";
import { TaskItem } from "./task-item";

const MAX_VISIBLE_OPEN_TASKS = 5;

interface TaskColumnProps {
  bucket: TaskBucket;
  title: string;
  subtitle?: string;
  variant?: "focus" | "shelf";
  openCount: number;
  tasks: Task[];
  activeCoDoTaskId?: string;
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
