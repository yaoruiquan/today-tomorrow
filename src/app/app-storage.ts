import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { createDefaultAppData } from "./default-app-data";
import type { AppData } from "./app-types";

const STORAGE_KEY = "today-tomorrow-app-data";
const APP_DATA_CHANGED_EVENT = "app-data-changed";

interface NativeAppDataChangedPayload {
  sourceId?: string;
}

export interface PersistedAppDataLoad {
  data: AppData;
  nativeAvailable: boolean;
  hadNativeData: boolean;
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export function canUseNativeAppData(): boolean {
  return Boolean(window.__TAURI_INTERNALS__);
}

export function loadAppData(fallback: AppData = createDefaultAppData()): AppData {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return fallback;

    return normalizeAppData(JSON.parse(saved), fallback);
  } catch {
    return fallback;
  }
}

export function saveAppData(data: AppData): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearAppData(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export async function loadPersistedAppData(
  fallback: AppData = createDefaultAppData()
): Promise<PersistedAppDataLoad> {
  const localData = loadAppData(fallback);

  if (!canUseNativeAppData()) {
    return {
      data: localData,
      nativeAvailable: false,
      hadNativeData: false
    };
  }

  try {
    const nativeData = await invoke<unknown | null>("load_app_data");

    if (!nativeData) {
      return {
        data: localData,
        nativeAvailable: true,
        hadNativeData: false
      };
    }

    const data = normalizeAppData(nativeData, fallback);
    saveAppData(data);

    return {
      data,
      nativeAvailable: true,
      hadNativeData: true
    };
  } catch (error) {
    console.warn("Falling back to local app data after native load failed.", error);
    return {
      data: localData,
      nativeAvailable: false,
      hadNativeData: false
    };
  }
}

export async function savePersistedAppData(data: AppData, sourceId: string): Promise<void> {
  saveAppData(data);

  if (!canUseNativeAppData()) return;

  try {
    await invoke("save_app_data", {
      data,
      sourceId
    });
  } catch (error) {
    console.warn("Native app data save failed; local fallback was updated.", error);
  }
}

export async function clearPersistedAppData(sourceId: string): Promise<void> {
  clearAppData();

  if (!canUseNativeAppData()) return;

  try {
    await invoke("clear_app_data", {
      sourceId
    });
  } catch (error) {
    console.warn("Native app data clear failed; local fallback was cleared.", error);
  }
}

export async function listenForPersistedAppDataChanges(
  sourceId: string,
  onChange: () => void
): Promise<UnlistenFn> {
  if (!canUseNativeAppData()) return () => {};

  return listen<NativeAppDataChangedPayload>(APP_DATA_CHANGED_EVENT, (event) => {
    if (event.payload?.sourceId === sourceId) return;
    onChange();
  });
}

function normalizeAppData(value: unknown, fallback: AppData): AppData {
  if (!value || typeof value !== "object") return fallback;

  const partial = value as Partial<AppData>;

  return {
    ...fallback,
    ...partial,
    schemaVersion: 1,
    tasks: Array.isArray(partial.tasks) ? partial.tasks : fallback.tasks,
    dayCycle: {
      ...fallback.dayCycle,
      ...partial.dayCycle
    },
    pet: {
      ...fallback.pet,
      ...partial.pet,
      panelOpen: false
    },
    panel: {
      ...fallback.panel,
      ...partial.panel,
      open: false
    },
    growth: {
      ...fallback.growth,
      ...partial.growth
    },
    settings: {
      ...fallback.settings,
      ...partial.settings
    }
  };
}
