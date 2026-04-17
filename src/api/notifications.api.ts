import apiClient from './client';

export const getNotifications = () =>
  apiClient.get('/notifications');

export const markAsRead = (notificationIds: string[]) =>
  apiClient.post('/notifications/readNotifications', { notificationIds });
