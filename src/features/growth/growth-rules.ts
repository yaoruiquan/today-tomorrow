import type { GrowthStage, GrowthState } from "./growth-types";

export function getGrowthStage(lightMemory: number): GrowthStage {
  if (lightMemory >= 30) return "dayNightWatcher";
  if (lightMemory >= 16) return "halo";
  if (lightMemory >= 7) return "stardust";
  if (lightMemory >= 2) return "glow";
  return "spark";
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
