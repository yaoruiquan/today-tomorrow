import { taskCopy } from "../task-copy";
import type { Task, TaskBucket } from "../task-types";
import { ColumnAdd } from "./column-add";
import { TaskItem } from "./task-item";

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
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
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
  onRename,
  onDelete,
  onStartCoDo,
  onStopCoDo
}: TaskColumnProps) {
  const visibleTasks = tasks.filter((task) => task.status !== "abandoned");

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
          visibleTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isCoDoing={activeCoDoTaskId === task.id}
              onToggle={onToggle}
              onMove={onMove}
              onRename={onRename}
              onDelete={onDelete}
              onStartCoDo={onStartCoDo}
              onStopCoDo={onStopCoDo}
            />
          ))
        ) : (
          <li className="empty">{bucket === "today" ? taskCopy.emptyToday : taskCopy.emptyTomorrow}</li>
        )}
      </ul>
    </section>
  );
}
