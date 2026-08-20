import { GoalDismissalReason } from "../types";

export const DISMISSAL_REASON_LABEL: Record<GoalDismissalReason, string> = {
  [GoalDismissalReason.ALREADY_DONE]: "כבר ביצעתי את זה בעבר",
  [GoalDismissalReason.NO_BUDGET]: "אין לי תקציב לזה כרגע",
  [GoalDismissalReason.NO_TIME]: "אין לי פנאי לזה כרגע",
  [GoalDismissalReason.RISK_MISMATCH]: "לא מתאים להעדפות הסיכון שלי",
  [GoalDismissalReason.TOO_COMPLEX]: "המשימה מורכבת לי מדי",
  [GoalDismissalReason.NOT_RELEVANT]: "לא רלוונטי למצב שלי",
  [GoalDismissalReason.OTHER]: "אחר",
};

/** Display order in the dismissal dialog; "other" stays last. */
export const DISMISSAL_REASON_ORDER: GoalDismissalReason[] = [
  GoalDismissalReason.ALREADY_DONE,
  GoalDismissalReason.NO_BUDGET,
  GoalDismissalReason.NO_TIME,
  GoalDismissalReason.RISK_MISMATCH,
  GoalDismissalReason.TOO_COMPLEX,
  GoalDismissalReason.NOT_RELEVANT,
  GoalDismissalReason.OTHER,
];
