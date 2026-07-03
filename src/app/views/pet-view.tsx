import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { useAppModel } from "../app-model";
import { GlowPet } from "../../features/pet/components/glow-pet";
import { PetMessage } from "../../features/pet/components/pet-message";
import { TaskPanel } from "../../features/tasks/components/task-panel";
import {
  isTauriRuntime,
  listenToCurrentWindowMove,
  setCurrentPetWindowPosition,
  showPanelNearPet,
  startDraggingPetWindow
} from "../../features/desktop-shell/window-events";

export function PetView() {
  const model = useAppModel();
  const modelRef = useRef(model);
  const panelRef = useRef<HTMLElement | null>(null);
  const suppressClickAfterDrag = useRef(false);

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  useEffect(() => {
    if (!isTauriRuntime()) return;

    let unlisten: (() => void) | undefined;
    const savedPosition = modelRef.current.data.pet.position;

    if (savedPosition) {
      void setCurrentPetWindowPosition(savedPosition);
    }

    void listenToCurrentWindowMove((position) => {
      modelRef.current.setPetPosition(position);
    }).then((cleanup) => {
      unlisten = cleanup;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        model.setPanelOpen(false);
      }
    }

    function closeOnOutsidePointer(event: PointerEvent) {
      if (!model.data.panel.open) return;
      if (panelRef.current?.contains(event.target as Node)) return;
      if ((event.target as HTMLElement).closest(".pet-shell-button")) return;
      model.setPanelOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [model]);

  function handlePetPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!isTauriRuntime() || event.button !== 0) return;

    const startX = event.clientX;
    const startY = event.clientY;
    let dragStarted = false;

    function cleanup() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", cleanup);
      window.removeEventListener("pointercancel", cleanup);
    }

    function handlePointerMove(pointerEvent: PointerEvent) {
      if (dragStarted) return;

      const distance = Math.hypot(pointerEvent.clientX - startX, pointerEvent.clientY - startY);
      if (distance < 4) return;

      dragStarted = true;
      suppressClickAfterDrag.current = true;
      cleanup();
      void startDraggingPetWindow();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", cleanup, { once: true });
    window.addEventListener("pointercancel", cleanup, { once: true });
  }

  async function handlePetClick() {
    if (suppressClickAfterDrag.current) {
      suppressClickAfterDrag.current = false;
      return;
    }

    const openedNativePanel = await showPanelNearPet();

    if (openedNativePanel) {
      model.showMessage("我回来了。");
      return;
    }

    model.togglePanel();
  }

  return (
    <main className="pet-window" aria-label="桌宠桌面态">
      <div className="pet-stage">
        <GlowPet
          mood={model.displayMood}
          growthStage={model.data.growth.stage}
          onClick={handlePetClick}
          onPointerDown={handlePetPointerDown}
        />
        <PetMessage
          key={model.data.pet.lastMessage ?? "empty-message"}
          message={model.data.pet.lastMessage}
          visible={Boolean(model.data.pet.lastMessage)}
        />
      </div>

      {model.data.panel.open ? (
        <section className="floating-panel" ref={panelRef} aria-label="展开的任务面板">
          <TaskPanel model={model} compact />
        </section>
      ) : null}
    </main>
  );
}
