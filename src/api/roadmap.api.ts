import apiClient from './client';

export const getRoadmap = () =>
  apiClient.get('/roadmap');

export const updateRoadmap = (updates: Record<string, unknown>) =>
  apiClient.post('/roadmap', { updates });
