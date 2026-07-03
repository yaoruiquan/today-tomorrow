import { toLocalDateKey } from "../features/day-cycle/local-date";
import { defaultSettings } from "../features/settings/default-settings";
import type { AppData } from "./app-types";

export function createDefaultAppData(localDate = toLocalDateKey(new Date())): AppData {
  return {
    schemaVersion: 1,
    tasks: [],
    dayCycle: {
      lastOpenedLocalDate: localDate
    },
    pet: {
      mood: "calm",
      panelOpen: false
    },
    panel: {
      open: false,
      mode: "tasks",
      anchor: "pet"
    },
    growth: {
      stage: "spark",
      completedTaskCount: 0,
      eveningReviewCount: 0,
      eveningReviewStreak: 0
    },
    settings: defaultSettings
  };
}
