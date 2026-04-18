import apiClient from './client';

export const connectBank = (userId: string) =>
  apiClient.post('/openfinance/connect', { userId });

export const syncBank = (dateRange?: { from: string; to: string }) =>
  apiClient.post('/openfinance/sync', dateRange ? { dateRange } : {});

export interface AnalysisResult {
  step_id: number;
  explanation: string;
}

/** Sends a JSON file as multipart/form-data. Returns the Gemini analysis. */
export const uploadFinancialReport = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return apiClient.post<AnalysisResult>('/openfinance/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
