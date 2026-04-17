import apiClient from './client';

export const connectBank = (userId: string) =>
  apiClient.post('/openfinance/connect', { userId });

export const syncBank = (dateRange?: { from: string; to: string }) =>
  apiClient.post('/openfinance/sync', dateRange ? { dateRange } : {});
