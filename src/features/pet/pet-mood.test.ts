import { describe, expect, it } from "vitest";
import { getBasePetMood } from "./pet-mood";

describe("pet mood", () => {
  it("sleeps when today is empty", () => {
    expect(getBasePetMood({ openTodayCount: 0, isEvening: false })).toBe("sleeping");
  });

  it("gets heavy when today is too full", () => {
    expect(getBasePetMood({ openTodayCount: 5, isEvening: false })).toBe("heavy");
  });

  it("uses evening mood after workday end", () => {
    expect(getBasePetMood({ openTodayCount: 2, isEvening: true })).toBe("evening");
  });

  it("stays calm during the day with a small open list", () => {
    expect(getBasePetMood({ openTodayCount: 2, isEvening: false })).toBe("calm");
  });
});
