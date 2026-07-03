import { useRef, useState } from "react";
import type { TaskBucket } from "../task-types";

interface QuickAddProps {
  onAdd: (title: string, bucket: TaskBucket) => void;
}

export function QuickAdd({ onAdd }: QuickAddProps) {
  const [title, setTitle] = useState("");
  const [bucket, setBucket] = useState<TaskBucket>("today");
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <form
      className="quick-add"
      onSubmit={(event) => {
        event.preventDefault();
        onAdd(title, bucket);
        if (title.trim()) setTitle("");
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }}
    >
      <input
        ref={inputRef}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
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
