import type { Settings } from "./settings-types";

export const defaultSettings: Settings = {
  workdayEndTime: "18:00",
  alwaysOnTop: true,
  visibleOnAllWorkspaces: true,
  launchAtLogin: false,
  reducedMotion: false,
  petThemeId: "warmGlow",
  glowIntensity: "soft",
  catchTomorrowEnabled: true,
  gentleRemindersEnabled: true,
  hoverInteractionEnabled: true,
  coDoCheckInEnabled: true,
  quietMode: {
    mode: "off"
  },
  desktopPlacement: "bottomRight"
};
