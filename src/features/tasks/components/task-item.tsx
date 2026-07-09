import { useEffect, useRef, useState } from "react";
import type { Task, TaskBucket } from "../task-types";

interface TaskItemProps {
  task: Task;
  isCoDoing?: boolean;
  onToggle: (id: string) => void;
  onMove: (id: string, bucket: TaskBucket) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onStartCoDo: (id: string) => void;
  onStopCoDo: () => void;
}

export function TaskItem({
  task,
  isCoDoing = false,
  onToggle,
  onMove,
  onRename,
  onDelete,
  onStartCoDo,
  onStopCoDo
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const nextBucket: TaskBucket = task.bucket === "today" ? "tomorrow" : "today";
  const isDone = task.status === "done";

  useEffect(() => {
    if (!isEditing) setDraftTitle(task.title);
  }, [isEditing, task.title]);

  useEffect(() => {
    if (!isEditing) return;

    window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [isEditing]);

  function saveDraftTitle() {
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onRename(task.id, trimmed);
    }
    setDraftTitle(trimmed || task.title);
    setIsEditing(false);
  }

  function cancelEditing() {
    setDraftTitle(task.title);
    setIsEditing(false);
  }

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
      {isEditing ? (
        <form
          className="task-title-edit-form"
          onSubmit={(event) => {
            event.preventDefault();
            saveDraftTitle();
          }}
        >
          <input
            ref={inputRef}
            className="task-title-edit-input"
            value={draftTitle}
            onBlur={saveDraftTitle}
            onChange={(event) => setDraftTitle(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key !== "Escape") return;
              event.preventDefault();
              cancelEditing();
            }}
            aria-label="编辑任务标题"
            autoComplete="off"
          />
        </form>
      ) : (
        <span className="task-title-wrap">
          <button
            className="task-title-edit-trigger"
            type="button"
            aria-label={`编辑任务：${task.title}`}
            onClick={() => setIsEditing(true)}
          >
            <span className="task-title">{task.title}</span>
          </button>
          {isCoDoing ? <span className="co-do-chip">陪做中</span> : null}
        </span>
      )}
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
      <button
        className="delete-button"
        type="button"
        aria-label="删除任务"
        title="删除任务"
        onClick={() => onDelete(task.id)}
      >
        ×
      </button>
    </li>
  );
}
