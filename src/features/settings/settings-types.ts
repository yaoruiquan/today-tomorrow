export const petThemeIds = [
  "warmGlow",
  "mintFocus",
  "lavenderCalm",
  "blueNight",
  "peachRest"
] as const;

export const glowIntensityIds = ["low", "soft", "bright"] as const;
export const quietModeIds = ["off", "oneHour", "untilTomorrow", "always"] as const;
export const desktopPlacementIds = [
  "bottomRight",
  "bottomLeft",
  "topRight",
  "topLeft",
  "lastPosition"
] as const;

export type PetThemeId = (typeof petThemeIds)[number];
export type GlowIntensity = (typeof glowIntensityIds)[number];
export type QuietModeId = (typeof quietModeIds)[number];
export type DesktopPlacementId = (typeof desktopPlacementIds)[number];

export interface QuietModeSetting {
  mode: QuietModeId;
  until?: string;
}

export interface Settings {
  workdayEndTime: string;
  alwaysOnTop: boolean;
  visibleOnAllWorkspaces: boolean;
  launchAtLogin: boolean;
  reducedMotion: boolean;
  petThemeId: PetThemeId;
  glowIntensity: GlowIntensity;
  catchTomorrowEnabled: boolean;
  gentleRemindersEnabled: boolean;
  hoverInteractionEnabled: boolean;
  coDoCheckInEnabled: boolean;
  quietMode: QuietModeSetting;
  desktopPlacement: DesktopPlacementId;
}
