import type { UserGoal } from "../types";

export interface SnoozePreset {
  label: string;
  days: number;
}

export const SNOOZE_PRESETS: SnoozePreset[] = [
  { label: "לשלושה ימים", days: 3 },
  { label: "לשבוע", days: 7 },
  { label: "לחודש", days: 30 },
];

/** Longest deferral offered by the picker and enforced by the server (~2 months). */
export const MAX_SNOOZE_DAYS = 60;

export const isSnoozed = (goal: UserGoal): boolean =>
  goal.snoozedUntil != null && new Date(goal.snoozedUntil).getTime() > Date.now();

export const addDays = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const formatSnoozeDate = (value: string): string =>
  new Date(value).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
  });
