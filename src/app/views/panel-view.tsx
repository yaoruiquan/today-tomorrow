import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useAppModel } from "../app-model";
import { hidePanelWindow, isTauriRuntime, recordUiDiagnostic } from "../../features/desktop-shell/window-events";
import { TaskPanel } from "../../features/tasks/components/task-panel";

export function PanelView() {
  const model = useAppModel();
  const panelRootRef = useRef<HTMLElement | null>(null);
  const internalInteractionUntil = useRef(0);
  const openedAt = useRef(Date.now());

  useEffect(() => {
    if (!isTauriRuntime()) return;

    let blurTimer: number | undefined;
    const INTERNAL_INTERACTION_GRACE_MS = 900;
    const OPEN_GRACE_MS = 650;

    function hide() {
      void hidePanelWindow();
    }

    function markInternalInteraction() {
      internalInteractionUntil.current = Date.now() + INTERNAL_INTERACTION_GRACE_MS;
      cancelBlurHide();
    }

    function isProtectedInteractionWindow() {
      const now = Date.now();
      return now < internalInteractionUntil.current || now - openedAt.current < OPEN_GRACE_MS;
    }

    function hideAfterConfirmedExternalBlur() {
      if (blurTimer) window.clearTimeout(blurTimer);

      blurTimer = window.setTimeout(() => {
        if (isProtectedInteractionWindow()) return;
        if (document.hasFocus()) return;
        hide();
      }, 240);
    }

    function cancelBlurHide() {
      if (!blurTimer) return;
      window.clearTimeout(blurTimer);
      blurTimer = undefined;
    }

    function hideOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      hide();
    }

    const panelRoot = panelRootRef.current;

    panelRoot?.addEventListener("pointerdown", markInternalInteraction, true);
    panelRoot?.addEventListener("focusin", markInternalInteraction, true);
    window.addEventListener("blur", hideAfterConfirmedExternalBlur);
    window.addEventListener("focus", cancelBlurHide);
    document.addEventListener("keydown", hideOnEscape);

    return () => {
      cancelBlurHide();
      panelRoot?.removeEventListener("pointerdown", markInternalInteraction, true);
      panelRoot?.removeEventListener("focusin", markInternalInteraction, true);
      window.removeEventListener("blur", hideAfterConfirmedExternalBlur);
      window.removeEventListener("focus", cancelBlurHide);
      document.removeEventListener("keydown", hideOnEscape);
    };
  }, []);

  useEffect(() => {
    const timers = [80, 180, 360, 620].map((delay) =>
      window.setTimeout(() => {
        const input = quickAddInput(panelRootRef.current);
        input?.focus();

        if (input && document.activeElement === input) {
          void recordUiDiagnostic("quick-add-autofocus", {
            delayMs: delay,
            activeElement: focusDiagnostic(input)
          });
        }
      }, delay)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  function trapFocus(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;

    const focusable = focusableElements(panelRootRef.current);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const root = panelRootRef.current;

    if (root && !root.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

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
      onPointerDownCapture={() => {
        internalInteractionUntil.current = Date.now() + 900;
      }}
      onFocusCapture={() => {
        internalInteractionUntil.current = Date.now() + 900;
      }}
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

function quickAddInput(root: HTMLElement | null): HTMLElement | undefined {
  return root?.querySelector<HTMLElement>('[data-panel-primary-input="true"]') ?? firstFocusableElement(root);
}

function focusDiagnostic(element: HTMLElement): Record<string, unknown> {
  return {
    tagName: element.tagName.toLowerCase(),
    className: element.className,
    ariaLabel: element.getAttribute("aria-label"),
    placeholder: element.getAttribute("placeholder")
  };
}
