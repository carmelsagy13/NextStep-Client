import type { UserGoal } from "../types";
import { UserGoalStatus } from "../types";

/**
 * The roadmap step a task belongs to. The server records where it was assigned
 * and where it was completed; rows predating those columns fall back to the
 * roadmap template's step — which is only an eligibility threshold — and
 * finally to the viewed step, so a task is never hidden from every view.
 */
export function goalStepId(goal: UserGoal, fallbackStepId: number): number {
  const completedStep =
    goal.status === UserGoalStatus.COMPLETED ? goal.completedAtStep : null;
  return (
    completedStep ??
    goal.assignedAtStep ??
    goal.roadmapGoal?.stepId ??
    fallbackStepId
  );
}
