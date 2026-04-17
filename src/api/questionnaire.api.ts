import apiClient from './client';

export const submitQuestionnaire = (answers: Record<string, unknown>) =>
  apiClient.post('/questionnaire', { answers });
