import { useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from "../api/auth.api";
import { getProfile } from "../api/profile.api";

/**
 * Auth hook — session-only. No data is persisted to localStorage.
 * User profile is fetched from the server on every login so it is always fresh.
 */
export function useAuth() {
  const {
    accessToken,
    userId,
    userProfile,
    setAuth,
    setUserProfile,
    clearAuth,
  } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      try {
        const res = await apiLogin(email, password);
        const { accessToken: token, userId: uid } = res.data;
        setAuth(token, uid);
        // Always fetch fresh user details after login
        try {
          const profileRes = await getProfile();
          setUserProfile(profileRes.data);
        } catch {
          // Profile may not exist yet (new user) — not an error
        }
        return {};
      } catch (err) {
        const msg = (
          err as { response?: { data?: { message?: string | string[] } } }
        ).response?.data?.message;
        const errorText = Array.isArray(msg) ? msg[0] : msg;
        return { error: errorText || "Invalid credentials. Please try again." };
      }
    },
    [setAuth, setUserProfile],
  );

  const signup = useCallback(
    async (
      id: string,
      email: string,
      password: string,
    ): Promise<{ error?: string }> => {
      try {
        const res = await apiRegister(id, email, password);
        const { accessToken: token, userId: uid } = res.data;
        setAuth(token, uid);
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
    clearAuth();
  }, [clearAuth]);

  return {
    login,
    signup,
    logout,
    isAuthenticated: !!accessToken,
    userId,
    userProfile,
    isLoading: false,
  };
}
