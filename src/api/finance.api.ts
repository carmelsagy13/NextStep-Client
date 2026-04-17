import apiClient from './client';

export const getSnapshot = () =>
  apiClient.get('/finance/snapshot');

export const getEvents = () =>
  apiClient.get('/events');
