import { describe, expect, it } from "vitest";
import { getGrowthStage } from "./growth-rules";

describe("growth rules", () => {
  it("keeps growth visual and light", () => {
    expect(getGrowthStage(0)).toBe("spark");
    expect(getGrowthStage(1)).toBe("glow");
    expect(getGrowthStage(3)).toBe("stardust");
    expect(getGrowthStage(10)).toBe("halo");
    expect(getGrowthStage(21)).toBe("dayNightWatcher");
  });
});
