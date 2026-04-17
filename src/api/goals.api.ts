import apiClient from './client';

export const getGoals = () =>
  apiClient.get('/goals');

export const createGoal = (goalName: string, targetAmount: number, targetDate?: string) =>
  apiClient.post('/goals', { goalName, targetAmount, targetDate });

export const updateGoal = (goalId: string, fields: Record<string, unknown>) =>
  apiClient.post('/goals/update', { goalId, ...fields });

export const deleteGoal = (goalId: string) =>
  apiClient.post('/goals/delete', { goalId });
