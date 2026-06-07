import apiClient from "./client";
import type { UserGoalStatus } from "../types";

export const getGoals = (status?: UserGoalStatus) =>
  apiClient.get("/goals", { params: status ? { status } : undefined });

export const createGoal = (
  goalName: string,
  targetAmount: number,
  targetDate?: string,
) => apiClient.post("/goals", { goalName, targetAmount, targetDate });

export const updateGoal = (
  goalId: string,
  fields: { currentAmount?: unknown; status?: UserGoalStatus },
) => {
  const payload: Record<string, unknown> = { goalId };
  if (fields.currentAmount !== undefined) {
    const n = Number(fields.currentAmount);
    payload.currentAmount = Number.isFinite(n) ? n : 0;
  }
  if (fields.status !== undefined) {
    payload.status = fields.status;
  }
  return apiClient.post("/goals/update", payload);
};

export const deleteGoal = (goalId: string) =>
  apiClient.post("/goals/delete", { goalId });
