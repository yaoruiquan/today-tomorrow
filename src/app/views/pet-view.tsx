import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import { useAppModel } from "../app-model";
import { GlowPet } from "../../features/pet/components/glow-pet";
import { PetMessage } from "../../features/pet/components/pet-message";
import { TaskPanel } from "../../features/tasks/components/task-panel";
import {
  isTauriRuntime,
  listenToCurrentWindowMove,
  readCurrentPetWindowPosition,
  readCurrentPetWindowScaleFactor,
  setCurrentPetWindowPosition,
  showPanelNearPet,
  trackPetWindowPosition
} from "../../features/desktop-shell/window-events";
import type { DesktopPosition } from "../../features/desktop-shell/desktop-window-types";

const PET_DRAG_THRESHOLD_PX = 6;
const PET_DRAG_POSITION_SYNC_DELAYS_MS = [120, 420, 900, 1800, 3200, 5000];
const PET_POINTER_CLICK_WINDOW_MS = 8000;

export function PetView() {
  const model = useAppModel();
  const modelRef = useRef(model);
  const panelRef = useRef<HTMLElement | null>(null);
  const suppressClickUntil = useRef(0);
  const lastPointerDown = useRef<{ screenX: number; screenY: number; at: number } | null>(null);
  const lastAppliedWindowPosition = useRef<string | null>(null);
  const lastObservedWindowPosition = useRef<string | null>(null);

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  useEffect(() => {
    if (!isTauriRuntime()) return;

    let unlisten: (() => void) | undefined;

    void listenToCurrentWindowMove((position) => {
      const key = positionKey(position);
      lastObservedWindowPosition.current = key;
      lastAppliedWindowPosition.current = key;
      modelRef.current.setPetPosition(position);
    }).then((cleanup) => {
      unlisten = cleanup;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    if (!isTauriRuntime()) return;

    const savedPosition = model.data.pet.position;
    if (!savedPosition) return;

    const key = positionKey(savedPosition);
    if (lastAppliedWindowPosition.current === key || lastObservedWindowPosition.current === key) return;

    lastAppliedWindowPosition.current = key;
    void setCurrentPetWindowPosition(savedPosition);
  }, [model.data.pet.position]);

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

    const target = event.currentTarget;
    const pointerId = event.pointerId;
    const startScreenX = event.screenX;
    const startScreenY = event.screenY;
    let activePointer = true;
    let didStartDrag = false;
    let cleanupTimer: number | undefined;
    let startWindowPosition: DesktopPosition | null = null;
    let scaleFactor = 1;
    let lastDragScreenX = startScreenX;
    let lastDragScreenY = startScreenY;

    event.preventDefault();
    lastPointerDown.current = {
      screenX: startScreenX,
      screenY: startScreenY,
      at: Date.now()
    };
    void trackPetWindowPosition();
    void Promise.all([readCurrentPetWindowPosition(), readCurrentPetWindowScaleFactor()]).then(([position, nextScaleFactor]) => {
      if (!activePointer) return;
      if (!position) return;
      startWindowPosition = position;
      scaleFactor = nextScaleFactor;

      if (didStartDrag && startWindowPosition) {
        movePetWindowTo(lastDragScreenX, lastDragScreenY);
      }
    });
    target.focus({ preventScroll: true });
    target.setPointerCapture(pointerId);

    function cleanup(pointerEvent: PointerEvent) {
      activePointer = false;

      if (pointerEvent.type === "pointerup" && !didStartDrag) {
        suppressPetClickFor(180);
        void openPetPanel();
      } else if (didStartDrag) {
        suppressPetClickFor(3000);
        scheduleNativePositionSync();
      }

      removePointerListeners(pointerEvent.pointerId);
    }

    function handlePointerMove(pointerEvent: PointerEvent) {
      if (!activePointer) return;

      lastDragScreenX = pointerEvent.screenX;
      lastDragScreenY = pointerEvent.screenY;

      if (!didStartDrag && pointerDistance(pointerEvent.screenX, pointerEvent.screenY) < PET_DRAG_THRESHOLD_PX) {
        return;
      }

      pointerEvent.preventDefault();

      if (!didStartDrag) {
        didStartDrag = true;
        suppressPetClickFor(12000);
      }

      movePetWindowTo(pointerEvent.screenX, pointerEvent.screenY);
    }

    function movePetWindowTo(screenX: number, screenY: number) {
      if (!startWindowPosition) return;

      const position = {
        x: Math.round(startWindowPosition.x + (screenX - startScreenX) * scaleFactor),
        y: Math.round(startWindowPosition.y + (screenY - startScreenY) * scaleFactor)
      };

      void setCurrentPetWindowPosition(position)
        .then(() => {
          const key = positionKey(position);
          lastObservedWindowPosition.current = key;
          lastAppliedWindowPosition.current = key;
          modelRef.current.setPetPosition(position);
        })
        .catch((error) => {
          console.warn("Manual pet window move failed.", error);
        });
    }

    function pointerDistance(screenX: number, screenY: number) {
      return Math.hypot(screenX - startScreenX, screenY - startScreenY);
    }

    function releasePointerCapture(pointerId: number) {
      if (target.hasPointerCapture(pointerId)) {
        target.releasePointerCapture(pointerId);
      }
    }

    function removePointerListeners(pointerId: number) {
      releasePointerCapture(pointerId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", cleanup);
      window.removeEventListener("pointercancel", cleanup);

      if (cleanupTimer) {
        window.clearTimeout(cleanupTimer);
        cleanupTimer = undefined;
      }
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", cleanup, { once: true });
    window.addEventListener("pointercancel", cleanup, { once: true });
    cleanupTimer = window.setTimeout(() => {
      if (didStartDrag) scheduleNativePositionSync();
      activePointer = false;
      removePointerListeners(pointerId);
    }, 8000);
  }

  async function handlePetClick(event?: ReactMouseEvent<HTMLButtonElement>) {
    if (Date.now() < suppressClickUntil.current || shouldSuppressPointerClick(event)) {
      return;
    }

    await openPetPanel();
  }

  async function openPetPanel() {
    const openedNativePanel = await showPanelNearPet();

    if (openedNativePanel) {
      model.showMessage("我回来了。");
      return;
    }

    model.togglePanel();
  }

  function suppressPetClickFor(durationMs: number) {
    suppressClickUntil.current = Math.max(suppressClickUntil.current, Date.now() + durationMs);
  }

  function shouldSuppressPointerClick(event?: ReactMouseEvent<HTMLButtonElement>) {
    if (!event || !isTauriRuntime()) return false;

    const pointerDown = lastPointerDown.current;
    if (!pointerDown) return false;

    const clickAgeMs = Date.now() - pointerDown.at;
    if (clickAgeMs > PET_POINTER_CLICK_WINDOW_MS) return false;

    const clickDistance = Math.hypot(event.screenX - pointerDown.screenX, event.screenY - pointerDown.screenY);
    if (clickDistance < PET_DRAG_THRESHOLD_PX) return false;

    lastPointerDown.current = null;
    suppressPetClickFor(2000);
    return true;
  }

  function scheduleNativePositionSync() {
    for (const delay of PET_DRAG_POSITION_SYNC_DELAYS_MS) {
      window.setTimeout(() => {
        void syncNativePetPosition();
      }, delay);
    }
  }

  async function syncNativePetPosition() {
    const position = await readCurrentPetWindowPosition();
    if (!position) return;

    const key = positionKey(position);
    lastObservedWindowPosition.current = key;
    lastAppliedWindowPosition.current = key;
    modelRef.current.setPetPosition(position);
  }

  return (
    <main
      className="pet-window"
      aria-label="桌宠桌面态"
      data-theme={model.data.settings.petThemeId}
      data-glow={model.data.settings.glowIntensity}
      data-reduced-motion={model.data.settings.reducedMotion ? "true" : undefined}
      data-quiet={model.quietModeActive ? "true" : undefined}
    >
      <div className="pet-stage">
        <GlowPet
          mood={model.displayMood}
          growthStage={model.data.growth.stage}
          reaction={petReactionFromMessage(model.data.pet.lastMessage, Boolean(model.activeCoDoTask))}
          hoverEnabled={model.data.settings.hoverInteractionEnabled}
          quietModeActive={model.quietModeActive}
          gentleReminderActive={model.gentleReminderActive}
          coDoActive={Boolean(model.activeCoDoTask)}
          onClick={handlePetClick}
          onPointerDown={handlePetPointerDown}
        />
        <PetMessage
          key={model.data.pet.lastMessage ?? "empty-message"}
          message={model.data.pet.lastMessage}
          visible={!isTauriRuntime() && Boolean(model.data.pet.lastMessage)}
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

function positionKey(position: { x: number; y: number }): string {
  return `${Math.round(position.x)}:${Math.round(position.y)}`;
}

function petReactionFromMessage(message: string | undefined, coDoActive: boolean) {
  if (coDoActive) return "coDo";
  if (!message) return undefined;
  if (message.includes("接住") || message.includes("明天已经")) return "catch";
  if (message.includes("完成")) return "complete";
  if (message.includes("放进") || message.includes("明天会")) return "record";
  if (message.includes("收起来") || message.includes("收好")) return "review";
  return undefined;
}
