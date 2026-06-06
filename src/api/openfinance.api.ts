import apiClient from './client';
import type { UploadAnalysisResponse } from '../types';

export const connectBank = (userId: string) =>
  apiClient.post('/openfinance/connect', { userId });

export const syncBank = (dateRange?: { from: string; to: string }) =>
  apiClient.post('/openfinance/sync', dateRange ? { dateRange } : {});

/**
 * Direct Bank Sync — connects to the Open Finance provider for the given
 * externalUserId, polls until the job completes server-side, then returns
 * the same analysis payload shape as POST /openfinance/upload.
 *
 * Long timeout (120s) to accommodate backend polling.
 */
export const connectBankApi = (externalUserId: string) =>
  apiClient.post<UploadAnalysisResponse>(
    '/openfinance/connect-api',
    { externalUserId },
    { timeout: 120_000 },
  );

/**
 * Wipes the user's roadmap, goals, and financial snapshot from the DB.
 * Call reset() from roadmapStore after this resolves to clear local state.
 */
export const resetAccountData = () =>
  apiClient.delete('/openfinance/reset-account');

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
