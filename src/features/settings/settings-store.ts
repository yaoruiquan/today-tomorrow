import type { Settings } from "./settings-types";

export function isEveningByTime(now: Date, workdayEndTime: Settings["workdayEndTime"]): boolean {
  const [hourText, minuteText] = workdayEndTime.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;

  const end = new Date(now);
  end.setHours(hour, minute, 0, 0);

  return now >= end;
}
