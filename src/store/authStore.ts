import { create } from "zustand";

// Auth is intentionally in-memory only — nothing is written to localStorage or
// sessionStorage so that closing/refreshing the tab always requires re-login.

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userProfile: any | null;
  setAuth: (accessToken: string, userId: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUserProfile: (profile: any) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userId: null,
  userProfile: null,

  setAuth: (accessToken, userId) => {
    set({ accessToken, userId });
  },

  setUserProfile: (userProfile) => {
    set({ userProfile });
  },

  clearAuth: () => {
    set({ accessToken: null, userId: null, userProfile: null });
  },
}));
