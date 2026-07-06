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
        // TEMP diagnostic — check `demoMode` and whether `demoResult.mode` is "full".
        console.log("[useAuth.login] response data:", res.data);
        const {
          accessToken: token,
          userId: uid,
          id: displayId,
          email: userEmail,
          demoMode,
          demoResult,
        } = res.data;
        setAuth(token, uid, displayId, userEmail, demoMode);

        // In Demo Mode the login call itself runs the demo pipeline server-side.
        // On the first login (no profile), the full result is returned inline —
        // hydrate the store so the roadmap renders instantly. On subsequent
        // logins the sync runs in the background and the roadmap loads normally.
        if (demoMode) {
          if (demoResult?.mode === "full") {
            useRoadmapStore.getState().setFromUpload(demoResult.full);
          }
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
          demoResult,
        } = res.data;
        setAuth(token, uid, displayId, userEmail, demoMode);
        // Demo users skip the questionnaire — the login/register call runs the
        // pipeline server-side. Hydrate from the inline result when present.
        if (demoMode && demoResult?.mode === "full") {
          useRoadmapStore.getState().setFromUpload(demoResult.full);
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
