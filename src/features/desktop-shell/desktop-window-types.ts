import type { DesktopPlacementId } from "../settings/settings-types";

export type DesktopWindowType = "pet" | "panel" | "settings";
export type DesktopPlacement = DesktopPlacementId;

export interface DesktopPosition {
  x: number;
  y: number;
  screenId?: string;
}
