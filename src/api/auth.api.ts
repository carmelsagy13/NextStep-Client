import apiClient from "./client";

export const register = (id: string, email: string, password: string) =>
  apiClient.post("/auth/register", { id, email, password });

export const login = (email: string, password: string) =>
  apiClient.post("/auth/login", { email, password });

export const logout = () => apiClient.post("/auth/logout");
