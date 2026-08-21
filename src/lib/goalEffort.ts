import { GoalEffortLevel } from "../types";

export const EFFORT_LABEL: Record<GoalEffortLevel, string> = {
  [GoalEffortLevel.QUICK]: "כמה דקות",
  [GoalEffortLevel.MODERATE]: "כחצי שעה",
  [GoalEffortLevel.PROJECT]: "דורש תכנון",
};

/** Display order, lightest first — used by the badge and the filter chips. */
export const EFFORT_ORDER: GoalEffortLevel[] = [
  GoalEffortLevel.QUICK,
  GoalEffortLevel.MODERATE,
  GoalEffortLevel.PROJECT,
];

export const EFFORT_BADGE_CLASS: Record<GoalEffortLevel, string> = {
  [GoalEffortLevel.QUICK]:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  [GoalEffortLevel.MODERATE]:
    "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-300",
  [GoalEffortLevel.PROJECT]:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
};
