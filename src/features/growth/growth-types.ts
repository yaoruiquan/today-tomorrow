export type GrowthStage = "seedLight" | "smallGlow" | "starCore" | "holdingGlow" | "dayNightCore";

export interface GrowthState {
  stage: GrowthStage;
  completedTaskCount: number;
  eveningReviewCount: number;
  eveningReviewStreak: number;
  recordedTaskCount: number;
  tomorrowCatchCount: number;
  coDoSessionCount: number;
}
