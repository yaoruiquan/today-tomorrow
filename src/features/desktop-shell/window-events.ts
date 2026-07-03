import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import type { DesktopPosition } from "./desktop-window-types";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export function isTauriRuntime(): boolean {
  return Boolean(window.__TAURI_INTERNALS__);
}

export async function showPanelNearPet(): Promise<boolean> {
  if (!isTauriRuntime()) return false;
  await invoke("show_panel_near_pet");
  return true;
}

export async function hidePanelWindow(): Promise<boolean> {
  if (!isTauriRuntime()) return false;
  await invoke("hide_panel");
  return true;
}

export async function savePetPosition(position: DesktopPosition): Promise<boolean> {
  if (!isTauriRuntime()) return false;
  await invoke("save_pet_position", { position });
  return true;
}

export async function startDraggingPetWindow(): Promise<boolean> {
  if (!isTauriRuntime()) return false;
  await getCurrentWindow().startDragging();
  return true;
}

export async function setCurrentPetWindowPosition(position: DesktopPosition): Promise<boolean> {
  if (!isTauriRuntime()) return false;
  await getCurrentWindow().setPosition(new PhysicalPosition(Math.round(position.x), Math.round(position.y)));
  return true;
}

export async function listenToCurrentWindowMove(
  onMove: (position: DesktopPosition) => void
): Promise<() => void> {
  if (!isTauriRuntime()) return () => {};

  return getCurrentWindow().onMoved(({ payload }) => {
    const position = {
      x: payload.x,
      y: payload.y
    };

    onMove(position);
    void savePetPosition(position);
  });
}
