import { taskCopy } from "../task-copy";
import type { Task, TaskBucket } from "../task-types";
import { TaskItem } from "./task-item";

interface TaskColumnProps {
  bucket: TaskBucket;
  title: string;
  openCount: number;
  tasks: Task[];
  onToggle: (id: string) => void;
  onMove: (id: string, bucket: TaskBucket) => void;
}

export function TaskColumn({ bucket, title, openCount, tasks, onToggle, onMove }: TaskColumnProps) {
  return (
    <section className="task-column" aria-labelledby={`${bucket}-title`}>
      <div className="column-head">
        <h3 id={`${bucket}-title`}>{title}</h3>
        <span className="counter">{openCount}</span>
      </div>
      <ul className="task-list">
        {tasks.length ? (
          tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={onToggle} onMove={onMove} />
          ))
        ) : (
          <li className="empty">{bucket === "today" ? taskCopy.emptyToday : taskCopy.emptyTomorrow}</li>
        )}
      </ul>
    </section>
  );
}
