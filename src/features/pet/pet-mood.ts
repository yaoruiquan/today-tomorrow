export type PetMood = "calm" | "happy" | "heavy" | "evening" | "sleeping";

interface MoodInput {
  openTodayCount: number;
  isEvening: boolean;
}

export function getBasePetMood(input: MoodInput): PetMood {
  if (input.openTodayCount === 0) return "sleeping";
  if (input.isEvening) return "evening";
  if (input.openTodayCount >= 5) return "heavy";
  return "calm";
}
