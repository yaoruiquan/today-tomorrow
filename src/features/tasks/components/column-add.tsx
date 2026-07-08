import { useRef, useState } from "react";
import { recordUiDiagnostic } from "../../desktop-shell/window-events";
import type { TaskBucket } from "../task-types";

interface ColumnAddProps {
  bucket: TaskBucket;
  placeholder: string;
  inputLabel: string;
  buttonLabel: string;
  autoFocusTarget?: boolean;
  onAdd: (title: string, bucket: TaskBucket) => void;
  onEmptySubmit: (bucket: TaskBucket) => void;
}

export function ColumnAdd({
  bucket,
  placeholder,
  inputLabel,
  buttonLabel,
  autoFocusTarget = false,
  onAdd,
  onEmptySubmit
}: ColumnAddProps) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  function recordFocus(reason: string) {
    const input = inputRef.current;
    if (!input || document.activeElement !== input) return;

    void recordUiDiagnostic("quick-add-focused", {
      reason,
      surface: "column-add",
      bucket,
      valueLength: input.value.length,
      placeholder: input.placeholder,
      ariaLabel: input.getAttribute("aria-label")
    });
  }

  function refocusAfterSubmit(submittedTitleLength: number) {
    window.setTimeout(() => {
      inputRef.current?.focus();

      if (inputRef.current && document.activeElement === inputRef.current) {
        void recordUiDiagnostic("quick-add-refocus-after-submit", {
          surface: "column-add",
          bucket,
          submittedTitleLength
        });
      }
    }, 0);
  }

  return (
    <form
      className="column-add"
      data-bucket={bucket}
      onSubmit={(event) => {
        event.preventDefault();

        const submittedTitle = title.trim();
        if (!submittedTitle) {
          onEmptySubmit(bucket);
          refocusAfterSubmit(0);
          return;
        }

        onAdd(title, bucket);
        setTitle("");
        refocusAfterSubmit(submittedTitle.length);
      }}
    >
      <input
        ref={inputRef}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onFocus={() => recordFocus("focus-event")}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        aria-label={inputLabel}
        data-panel-primary-input={autoFocusTarget ? "true" : undefined}
      />
      <button className="column-add-button" type="submit" aria-label={buttonLabel}>
        +
      </button>
    </form>
  );
}
