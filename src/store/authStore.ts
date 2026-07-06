import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Auth is persisted to sessionStorage — survives page refreshes within the
// same tab, but clears when the tab or browser is closed.

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  /** Human-readable 9-character identifier (e.g. national ID). */
  displayId: string | null;
  email: string | null;
  /** Whether the backend flagged this session for the automated Demo Mode. */
  demoMode: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userProfile: any | null;
  setAuth: (
    accessToken: string,
    userId: string,
    displayId?: string,
    email?: string,
    demoMode?: boolean,
  ) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUserProfile: (profile: any) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      userId: null,
      displayId: null,
      email: null,
      demoMode: false,
      userProfile: null,

      setAuth: (accessToken, userId, displayId, email, demoMode) => {
        let resolvedEmail = email ?? null;
        if (!resolvedEmail) {
          try {
            const payload = JSON.parse(atob(accessToken.split(".")[1]));
            resolvedEmail = payload.email ?? null;
          } catch {
            // ignore malformed token
          }
        }
        set({
          accessToken,
          userId,
          displayId: displayId ?? null,
          email: resolvedEmail,
          demoMode: demoMode ?? false,
        });
      },

      setUserProfile: (userProfile) => {
        set({ userProfile });
      },

      clearAuth: () => {
        set({
          accessToken: null,
          userId: null,
          displayId: null,
          email: null,
          demoMode: false,
          userProfile: null,
        });
      },
    }),
    {
      name: "nextstep-auth",
      storage: createJSONStorage(() => sessionStorage),
      // `demoMode` is a per-login decision made by the server — it must never
      // be persisted, otherwise a stale `true` from a previous demo login would
      // survive page refreshes even after DEMO_MODE is turned off on the
      // backend. Persist everything else.
      partialize: (state) => ({
        accessToken: state.accessToken,
        userId: state.userId,
        displayId: state.displayId,
        email: state.email,
        userProfile: state.userProfile,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Always start a rehydrated session as non-demo; only a fresh
        // login/register response can re-enable Demo Mode.
        state.demoMode = false;
        if (!state.email && state.accessToken) {
          try {
            const payload = JSON.parse(atob(state.accessToken.split(".")[1]));
            state.email = payload.email ?? null;
          } catch {
            // ignore malformed token
          }
        }
      },
    },
  ),
);
