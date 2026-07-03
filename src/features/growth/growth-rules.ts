import type { GrowthStage } from "./growth-types";

export function getGrowthStage(eveningReviewCount: number): GrowthStage {
  if (eveningReviewCount >= 21) return "dayNightWatcher";
  if (eveningReviewCount >= 10) return "halo";
  if (eveningReviewCount >= 3) return "stardust";
  if (eveningReviewCount >= 1) return "glow";
  return "spark";
}
