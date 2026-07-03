import { describe, expect, it } from "vitest";
import { isEveningByTime } from "./settings-store";

describe("settings store", () => {
  it("detects workday end without external calendars", () => {
    expect(isEveningByTime(new Date(2026, 6, 3, 18, 0), "18:00")).toBe(true);
    expect(isEveningByTime(new Date(2026, 6, 3, 17, 59), "18:00")).toBe(false);
  });
});
