export type GrowthStage = "spark" | "glow" | "stardust" | "halo" | "dayNightWatcher";

export interface GrowthState {
  stage: GrowthStage;
  completedTaskCount: number;
  eveningReviewCount: number;
  eveningReviewStreak: number;
  recordedTaskCount: number;
  tomorrowCatchCount: number;
  coDoSessionCount: number;
}
