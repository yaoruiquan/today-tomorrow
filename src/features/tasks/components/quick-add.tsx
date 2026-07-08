import { useRef, useState } from "react";
import { recordUiDiagnostic } from "../../desktop-shell/window-events";
import type { TaskBucket } from "../task-types";

interface QuickAddProps {
  onAdd: (title: string, bucket: TaskBucket) => void;
}

export function QuickAdd({ onAdd }: QuickAddProps) {
  const [title, setTitle] = useState("");
  const [bucket, setBucket] = useState<TaskBucket>("today");
  const inputRef = useRef<HTMLInputElement | null>(null);

  function recordFocus(reason: string) {
    const input = inputRef.current;
    if (!input || document.activeElement !== input) return;

    void recordUiDiagnostic("quick-add-focused", {
      reason,
      bucket,
      valueLength: input.value.length,
      placeholder: input.placeholder,
      ariaLabel: input.getAttribute("aria-label")
    });
  }

  return (
    <form
      className="quick-add"
      onSubmit={(event) => {
        event.preventDefault();
        const submittedTitle = title.trim();
        onAdd(title, bucket);
        if (submittedTitle) setTitle("");
        window.setTimeout(() => {
          inputRef.current?.focus();

          if (inputRef.current && document.activeElement === inputRef.current) {
            void recordUiDiagnostic("quick-add-refocus-after-submit", {
              bucket,
              submittedTitleLength: submittedTitle.length
            });
          }
        }, 0);
      }}
    >
      <input
        ref={inputRef}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onFocus={() => recordFocus("focus-event")}
        type="text"
        autoComplete="off"
        placeholder="写下一件事"
        aria-label="新增任务"
      />
      <div className="segmented" role="radiogroup" aria-label="任务日期">
        <label>
          <input
            type="radio"
            name="bucket"
            value="today"
            checked={bucket === "today"}
            onChange={() => setBucket("today")}
          />
          <span>今天</span>
        </label>
        <label>
          <input
            type="radio"
            name="bucket"
            value="tomorrow"
            checked={bucket === "tomorrow"}
            onChange={() => setBucket("tomorrow")}
          />
          <span>明天</span>
        </label>
      </div>
      <button className="add-button" type="submit" aria-label="添加任务">
        +
      </button>
    </form>
  );
}
