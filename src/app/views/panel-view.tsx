import { useEffect } from "react";
import { useAppModel } from "../app-model";
import { hidePanelWindow, isTauriRuntime } from "../../features/desktop-shell/window-events";
import { TaskPanel } from "../../features/tasks/components/task-panel";

export function PanelView() {
  const model = useAppModel();

  useEffect(() => {
    if (!isTauriRuntime()) return;

    function hide() {
      void hidePanelWindow();
    }

    function hideOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") hide();
    }

    window.addEventListener("blur", hide);
    document.addEventListener("keydown", hideOnEscape);

    return () => {
      window.removeEventListener("blur", hide);
      document.removeEventListener("keydown", hideOnEscape);
    };
  }, []);

  return (
    <main className="panel-window" aria-label="今天明天任务面板">
      <TaskPanel model={model} />
    </main>
  );
}
