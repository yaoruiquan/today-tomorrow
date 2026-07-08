import type { GrowthStage, GrowthState } from "./growth-types";

export function getGrowthStage(lightMemory: number): GrowthStage {
  if (lightMemory >= 30) return "dayNightCore";
  if (lightMemory >= 16) return "holdingGlow";
  if (lightMemory >= 7) return "starCore";
  if (lightMemory >= 2) return "smallGlow";
  return "seedLight";
}

export function getGrowthStageFromState(growth: GrowthState): GrowthStage {
  return getGrowthStage(growthLightMemory(growth));
}

export function growthLightMemory(growth: GrowthState): number {
  return (
    growth.recordedTaskCount +
    growth.completedTaskCount +
    growth.eveningReviewCount * 3 +
    growth.tomorrowCatchCount * 4 +
    growth.coDoSessionCount * 2
  );
}

export function normalizeGrowthStage(value: unknown, fallback: GrowthStage = "seedLight"): GrowthStage {
  switch (value) {
    case "seedLight":
    case "smallGlow":
    case "starCore":
    case "holdingGlow":
    case "dayNightCore":
      return value;
    case "spark":
      return "seedLight";
    case "glow":
      return "smallGlow";
    case "stardust":
      return "starCore";
    case "halo":
      return "holdingGlow";
    case "dayNightWatcher":
      return "dayNightCore";
    default:
      return fallback;
  }
}
