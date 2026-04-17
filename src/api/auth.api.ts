import apiClient from './client';

export const register = (email: string, password: string) =>
  apiClient.post('/auth/register', { email, password });

export const login = (email: string, password: string) =>
  apiClient.post('/auth/login', { email, password });

export const logout = () =>
  apiClient.post('/auth/logout');
