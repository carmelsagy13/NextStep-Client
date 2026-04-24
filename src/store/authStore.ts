import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  setAuth: (accessToken: string, userId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  userId: localStorage.getItem('userId'),

  setAuth: (accessToken, userId) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('userId', userId);
    set({ accessToken, userId });
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    set({ accessToken: null, userId: null });
  },
}));
