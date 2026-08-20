import { useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { useRoadmapStore } from "../store/roadmapStore";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from "../api/auth.api";
import { getProfile } from "../api/profile.api";
import { getGoals } from "../api/goals.api";

/**
 * Auth hook — session-only. No data is persisted to localStorage.
 * User profile is fetched from the server on every login so it is always fresh.
 */
export function useAuth() {
  const {
    accessToken,
    userId,
    displayId,
    email,
    userProfile,
    setAuth,
    setUserProfile,
    clearAuth,
  } = useAuthStore();

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ error?: string; redirectTo?: string }> => {
      try {
        const res = await apiLogin(email, password);
        const {
          accessToken: token,
          userId: uid,
          id: displayId,
          email: userEmail,
          demoMode,
          loginAnalysis,
        } = res.data;
        setAuth(token, uid, displayId, userEmail, demoMode);

        // The login call itself runs the full pipeline server-side (demo data in
        // Demo Mode, live Open Finance data otherwise) and returns the result
        // inline — hydrate the store so the roadmap renders instantly.
        if (loginAnalysis?.mode === "full") {
          useRoadmapStore.getState().setFromUpload(loginAnalysis.full);
          return { redirectTo: "/roadmap" };
        }
        if (demoMode) {
          return { redirectTo: "/roadmap" };
        }

        // Check whether this user already has financial data so the caller
        // can navigate to /setup (no data) or /roadmap (data present).
        let hasData = false;
        try {
          await getProfile();
          // Profile exists — also check if they have any goals.
          try {
            const goalsRes = await getGoals();
            const goals = Array.isArray(goalsRes.data) ? goalsRes.data : [];
            hasData = goals.length > 0;
          } catch {
            hasData = false;
          }
          // Store the profile for downstream components.
          try {
            const profileRes = await getProfile();
            setUserProfile(profileRes.data);
          } catch {
            // Non-critical — ignore.
          }
        } catch {
          // Profile 404 → genuinely new user, no data yet.
          hasData = false;
        }

        return { redirectTo: hasData ? "/roadmap" : "/setup" };
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
    ): Promise<{ error?: string; redirectTo?: string }> => {
      try {
        const res = await apiRegister(id, email, password);
        const {
          accessToken: token,
          userId: uid,
          id: displayId,
          email: userEmail,
          demoMode,
          loginAnalysis,
        } = res.data;
        setAuth(token, uid, displayId, userEmail, demoMode);
        // Demo users skip the questionnaire — the login/register call runs the
        // pipeline server-side. Hydrate from the inline result when present.
        if (demoMode && loginAnalysis?.mode === "full") {
          useRoadmapStore.getState().setFromUpload(loginAnalysis.full);
        }
        return { redirectTo: demoMode ? "/roadmap" : undefined };
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
    displayId,
    email,
    userProfile,
    isLoading: false,
  };
}
