import { describe, expect, it } from "vitest";
import { defaultSettings } from "./default-settings";
import { isEveningByTime, isQuietModeActive, normalizeSettings } from "./settings-store";

describe("settings store", () => {
  it("detects workday end without external calendars", () => {
    expect(isEveningByTime(new Date(2026, 6, 3, 18, 0), "18:00")).toBe(true);
    expect(isEveningByTime(new Date(2026, 6, 3, 17, 59), "18:00")).toBe(false);
  });

  it("normalizes theme and glow settings with safe fallbacks", () => {
    expect(
      normalizeSettings(
        {
          petThemeId: "mintFocus",
          glowIntensity: "bright",
          reducedMotion: true
        },
        defaultSettings
      )
    ).toMatchObject({
      petThemeId: "mintFocus",
      glowIntensity: "bright",
      reducedMotion: true,
      catchTomorrowEnabled: true,
      gentleRemindersEnabled: true,
      hoverInteractionEnabled: true,
      quietMode: {
        mode: "off"
      }
    });

    expect(
      normalizeSettings(
        {
          petThemeId: "neon",
          glowIntensity: "maximum",
          reducedMotion: "yes"
        },
        defaultSettings
      )
    ).toMatchObject({
      petThemeId: "warmGlow",
      glowIntensity: "soft",
      reducedMotion: false,
      desktopPlacement: "bottomRight"
    });
  });

  it("normalizes quiet mode and detects active durations", () => {
    const now = new Date("2026-07-03T08:00:00.000Z");

    expect(
      normalizeSettings(
        {
          quietMode: {
            mode: "always"
          }
        },
        defaultSettings
      ).quietMode
    ).toEqual({ mode: "always" });

    expect(
      isQuietModeActive(
        {
          mode: "oneHour",
          until: "2026-07-03T08:30:00.000Z"
        },
        now
      )
    ).toBe(true);
    expect(
      isQuietModeActive(
        {
          mode: "oneHour",
          until: "2026-07-03T07:30:00.000Z"
        },
        now
      )
    ).toBe(false);
  });
});
