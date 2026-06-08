import { useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from "../api/auth.api";

interface User {
  email: string;
  name?: string;
  userId: string;
}

/**
 * Drop-in replacement for the charming-gems localStorage-based useAuth hook.
 * Wraps the real Zustand authStore + NestJS auth API.
 */
export function useAuth() {
  const { accessToken, userId, setAuth, clearAuth } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      try {
        const res = await apiLogin(email, password);
        const { accessToken: token, userId: uid } = res.data;
        setAuth(token, uid);
        localStorage.setItem("userEmail", email);
        return {};
      } catch (err) {
        const msg = (
          err as { response?: { data?: { message?: string | string[] } } }
        ).response?.data?.message;
        const errorText = Array.isArray(msg) ? msg[0] : msg;
        return { error: errorText || "Invalid credentials. Please try again." };
      }
    },
    [setAuth],
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name?: string,
    ): Promise<{ error?: string }> => {
      try {
        const res = await apiRegister(email, password);
        const { accessToken: token, userId: uid } = res.data;
        setAuth(token, uid);
        localStorage.setItem("userEmail", email);
        if (name) localStorage.setItem("userName", name);
        return {};
      } catch (err) {
        const msg = (
          err as { response?: { data?: { message?: string | string[] } } }
        ).response?.data?.message;
        const errorText = Array.isArray(msg) ? msg[0] : msg;
        return { error: errorText || "Registration failed. Please try again." };
      }
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // best-effort
    }
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    clearAuth();
  }, [clearAuth]);

  const user: User | null = userId
    ? {
        email: localStorage.getItem("userEmail") || "",
        name: localStorage.getItem("userName") || undefined,
        userId,
      }
    : null;

  return {
    login,
    signup,
    logout,
    isAuthenticated: !!accessToken,
    user,
    isLoading: false,
  };
}
