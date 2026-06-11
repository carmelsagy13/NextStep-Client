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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userProfile: any | null;
  setAuth: (
    accessToken: string,
    userId: string,
    displayId?: string,
    email?: string,
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
      userProfile: null,

      setAuth: (accessToken, userId, displayId, email) => {
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
          userProfile: null,
        });
      },
    }),
    {
      name: "nextstep-auth",
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        if (state && !state.email && state.accessToken) {
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
