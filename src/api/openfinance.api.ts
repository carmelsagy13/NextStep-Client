import apiClient from './client';
import type { UploadAnalysisResponse } from '../types';

export const connectBank = (userId: string) =>
  apiClient.post('/openfinance/connect', { userId });

export const syncBank = (dateRange?: { from: string; to: string }) =>
  apiClient.post('/openfinance/sync', dateRange ? { dateRange } : {});

/** Sends a JSON file as multipart/form-data. Returns roadmap_state + user_goals.
 *  The userId is extracted from the Bearer token on the server — no need to pass it explicitly. */
export const uploadFinancialReport = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return apiClient.post<UploadAnalysisResponse>(
    '/openfinance/upload',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
};
