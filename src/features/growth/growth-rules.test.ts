import { describe, expect, it } from "vitest";
import { getGrowthStage, getGrowthStageFromState } from "./growth-rules";
import type { GrowthState } from "./growth-types";

describe("growth rules", () => {
  it("keeps growth visual and light", () => {
    expect(getGrowthStage(0)).toBe("seedLight");
    expect(getGrowthStage(2)).toBe("smallGlow");
    expect(getGrowthStage(7)).toBe("starCore");
    expect(getGrowthStage(16)).toBe("holdingGlow");
    expect(getGrowthStage(30)).toBe("dayNightCore");
  });

  it("can grow through stable use and catch tomorrow without completion scoring", () => {
    const growth: GrowthState = {
      stage: "seedLight",
      completedTaskCount: 0,
      eveningReviewCount: 0,
      eveningReviewStreak: 0,
      recordedTaskCount: 3,
      tomorrowCatchCount: 1,
      coDoSessionCount: 0
    };

    expect(getGrowthStageFromState(growth)).toBe("starCore");
  });
});
