export type GrowthStage = "seedLight" | "smallGlow" | "starCore" | "holdingGlow" | "dayNightCore";

export type GrowthEventType =
  | "recordToday"
  | "recordTomorrow"
  | "completeTask"
  | "catchTomorrow"
  | "eveningReview"
  | "coDo";

export interface GrowthEvent {
  id: string;
  type: GrowthEventType;
  at: string;
  stageBefore: GrowthStage;
  stageAfter: GrowthStage;
  stageChanged: boolean;
}

export interface GrowthState {
  stage: GrowthStage;
  completedTaskCount: number;
  eveningReviewCount: number;
  eveningReviewStreak: number;
  recordedTaskCount: number;
  tomorrowCatchCount: number;
  coDoSessionCount: number;
}
