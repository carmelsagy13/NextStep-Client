import apiClient from './client';

export const getGoals = () =>
  apiClient.get('/goals');

export const createGoal = (goalName: string, targetAmount: number, targetDate?: string) =>
  apiClient.post('/goals', { goalName, targetAmount, targetDate });

export const updateGoal = (goalId: string, fields: { currentAmount?: unknown; isCompleted?: unknown }) => {
  const payload: Record<string, unknown> = { goalId };
  if (fields.currentAmount !== undefined) {
    const n = Number(fields.currentAmount);
    payload.currentAmount = Number.isFinite(n) ? n : 0;
  }
  if (fields.isCompleted !== undefined) {
    payload.isCompleted = Boolean(fields.isCompleted);
  }
  return apiClient.post('/goals/update', payload);
};

export const deleteGoal = (goalId: string) =>
  apiClient.post('/goals/delete', { goalId });
