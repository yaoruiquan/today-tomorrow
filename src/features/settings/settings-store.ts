import type {
  DesktopPlacementId,
  GlowIntensity,
  PetThemeId,
  QuietModeId,
  QuietModeSetting,
  Settings
} from "./settings-types";
import { desktopPlacementIds, glowIntensityIds, petThemeIds, quietModeIds } from "./settings-types";

export function isEveningByTime(now: Date, workdayEndTime: Settings["workdayEndTime"]): boolean {
  const [hourText, minuteText] = workdayEndTime.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;

  const end = new Date(now);
  end.setHours(hour, minute, 0, 0);

  return now >= end;
}

export function normalizeSettings(value: unknown, fallback: Settings): Settings {
  const partial = value && typeof value === "object" ? (value as Partial<Settings>) : {};

  return {
    ...fallback,
    ...partial,
    petThemeId: normalizePetThemeId(partial.petThemeId, fallback.petThemeId),
    glowIntensity: normalizeGlowIntensity(partial.glowIntensity, fallback.glowIntensity),
    reducedMotion:
      typeof partial.reducedMotion === "boolean" ? partial.reducedMotion : fallback.reducedMotion,
    catchTomorrowEnabled: normalizeBoolean(
      partial.catchTomorrowEnabled,
      fallback.catchTomorrowEnabled
    ),
    gentleRemindersEnabled: normalizeBoolean(
      partial.gentleRemindersEnabled,
      fallback.gentleRemindersEnabled
    ),
    hoverInteractionEnabled: normalizeBoolean(
      partial.hoverInteractionEnabled,
      fallback.hoverInteractionEnabled
    ),
    coDoCheckInEnabled: normalizeBoolean(partial.coDoCheckInEnabled, fallback.coDoCheckInEnabled),
    quietMode: normalizeQuietMode(partial.quietMode, fallback.quietMode),
    desktopPlacement: normalizeDesktopPlacement(
      partial.desktopPlacement,
      fallback.desktopPlacement
    )
  };
}

export function normalizePetThemeId(value: unknown, fallback: PetThemeId = "warmGlow"): PetThemeId {
  return petThemeIds.includes(value as PetThemeId) ? (value as PetThemeId) : fallback;
}

export function normalizeGlowIntensity(
  value: unknown,
  fallback: GlowIntensity = "soft"
): GlowIntensity {
  return glowIntensityIds.includes(value as GlowIntensity) ? (value as GlowIntensity) : fallback;
}

export function normalizeQuietMode(
  value: unknown,
  fallback: QuietModeSetting = { mode: "off" }
): QuietModeSetting {
  if (!value || typeof value !== "object") return fallback;

  const partial = value as Partial<QuietModeSetting>;
  const mode = quietModeIds.includes(partial.mode as QuietModeId)
    ? (partial.mode as QuietModeId)
    : fallback.mode;

  if (mode === "always" || mode === "off") {
    return { mode };
  }

  return {
    mode,
    until: typeof partial.until === "string" ? partial.until : fallback.until
  };
}

export function normalizeDesktopPlacement(
  value: unknown,
  fallback: DesktopPlacementId = "bottomRight"
): DesktopPlacementId {
  return desktopPlacementIds.includes(value as DesktopPlacementId)
    ? (value as DesktopPlacementId)
    : fallback;
}

export function isQuietModeActive(
  quietMode: QuietModeSetting,
  now: Date = new Date()
): boolean {
  if (quietMode.mode === "always") return true;
  if (quietMode.mode === "off") return false;
  if (!quietMode.until) return false;

  const until = new Date(quietMode.until);
  if (Number.isNaN(until.getTime())) return false;

  return until > now;
}

export function quietModeUntil(mode: QuietModeId, now: Date = new Date()): string | undefined {
  if (mode === "oneHour") {
    return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  }

  if (mode === "untilTomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow.toISOString();
  }

  return undefined;
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}
