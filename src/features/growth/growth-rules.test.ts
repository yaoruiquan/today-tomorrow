import { describe, expect, it } from "vitest";
import { getGrowthStage, getGrowthStageFromState } from "./growth-rules";
import type { GrowthState } from "./growth-types";

describe("growth rules", () => {
  it("keeps growth visual and light", () => {
    expect(getGrowthStage(0)).toBe("spark");
    expect(getGrowthStage(2)).toBe("glow");
    expect(getGrowthStage(7)).toBe("stardust");
    expect(getGrowthStage(16)).toBe("halo");
    expect(getGrowthStage(30)).toBe("dayNightWatcher");
  });

  it("can grow through stable use and catch tomorrow without completion scoring", () => {
    const growth: GrowthState = {
      stage: "spark",
      completedTaskCount: 0,
      eveningReviewCount: 0,
      eveningReviewStreak: 0,
      recordedTaskCount: 3,
      tomorrowCatchCount: 1,
      coDoSessionCount: 0
    };

    expect(getGrowthStageFromState(growth)).toBe("stardust");
  });
});
