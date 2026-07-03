import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useAppModel } from "../app-model";
import { hidePanelWindow, isTauriRuntime } from "../../features/desktop-shell/window-events";
import { TaskPanel } from "../../features/tasks/components/task-panel";

export function PanelView() {
  const model = useAppModel();
  const panelRootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isTauriRuntime()) return;

    let blurTimer: number | undefined;

    function hide() {
      void hidePanelWindow();
    }

    function hideAfterConfirmedExternalBlur() {
      if (blurTimer) window.clearTimeout(blurTimer);

      blurTimer = window.setTimeout(() => {
        if (document.hasFocus()) return;
        hide();
      }, 180);
    }

    function cancelBlurHide() {
      if (!blurTimer) return;
      window.clearTimeout(blurTimer);
      blurTimer = undefined;
    }

    function hideOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") hide();
    }

    window.addEventListener("blur", hideAfterConfirmedExternalBlur);
    window.addEventListener("focus", cancelBlurHide);
    document.addEventListener("keydown", hideOnEscape);

    return () => {
      cancelBlurHide();
      window.removeEventListener("blur", hideAfterConfirmedExternalBlur);
      window.removeEventListener("focus", cancelBlurHide);
      document.removeEventListener("keydown", hideOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!isTauriRuntime()) return;

    window.setTimeout(() => {
      firstFocusableElement(panelRootRef.current)?.focus();
    }, 80);
  }, []);

  function trapFocus(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;

    const focusable = focusableElements(panelRootRef.current);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <main
      className="panel-window"
      ref={panelRootRef}
      aria-label="今天明天任务面板"
      data-theme={model.data.settings.petThemeId}
      data-glow={model.data.settings.glowIntensity}
      data-reduced-motion={model.data.settings.reducedMotion ? "true" : undefined}
      data-quiet={model.quietModeActive ? "true" : undefined}
      onKeyDown={trapFocus}
    >
      <TaskPanel model={model} />
    </main>
  );
}

function focusableElements(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];

  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => element.offsetParent !== null);
}

function firstFocusableElement(root: HTMLElement | null): HTMLElement | undefined {
  return focusableElements(root)[0];
}
