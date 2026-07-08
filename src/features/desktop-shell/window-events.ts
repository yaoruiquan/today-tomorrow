import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import type { DesktopPlacement, DesktopPosition } from "./desktop-window-types";

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

export async function trackPetWindowPosition(): Promise<boolean> {
  if (!isTauriRuntime()) return false;
  await invoke("track_pet_window_position");
  return true;
}

export async function readCurrentPetWindowPosition(): Promise<DesktopPosition | null> {
  if (!isTauriRuntime()) return null;

  const window = getCurrentWindow();
  const position = await window.outerPosition();

  return {
    x: Math.round(position.x),
    y: Math.round(position.y)
  };
}

export async function readCurrentPetWindowScaleFactor(): Promise<number> {
  if (!isTauriRuntime()) return 1;
  return getCurrentWindow().scaleFactor();
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

export async function recenterPetWindow(): Promise<boolean> {
  if (!isTauriRuntime()) return false;
  await invoke("recenter_pet_window");
  return true;
}

export async function placePetWindow(placement: DesktopPlacement): Promise<boolean> {
  if (!isTauriRuntime() || placement === "lastPosition") return false;
  await invoke("place_pet_window", { placement });
  return true;
}

export async function recordUiDiagnostic(event: string, details?: Record<string, unknown>): Promise<boolean> {
  if (!isTauriRuntime()) return false;
  await invoke("record_ui_diagnostic", {
    event,
    details: details ?? {}
  });
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

  const window = getCurrentWindow();

  return window.onMoved(({ payload }) => {
    const position = {
      x: Math.round(payload.x),
      y: Math.round(payload.y)
    };

    onMove(position);
    void savePetPosition(position);
  });
}
