import type { DayCycleState } from "../features/day-cycle/day-cycle-types";
import type { GrowthState } from "../features/growth/growth-types";
import type { PetMood } from "../features/pet/pet-mood";
import type { Settings } from "../features/settings/settings-types";
import type { Task } from "../features/tasks/task-types";

export interface PetPosition {
  x: number;
  y: number;
  screenId?: string;
}

export interface PetState {
  mood: PetMood;
  position?: PetPosition;
  panelOpen: boolean;
  lastMessage?: string;
}

export type PanelMode = "tasks" | "eveningReview";

export interface PanelState {
  open: boolean;
  mode: PanelMode;
  anchor: "pet";
}

export interface AppData {
  schemaVersion: number;
  tasks: Task[];
  dayCycle: DayCycleState;
  pet: PetState;
  panel: PanelState;
  growth: GrowthState;
  settings: Settings;
}
