import { useState, useEffect, useCallback } from 'react';

interface User {
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

const AUTH_KEY = 'nextstep_auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // Load user from localStorage on mount
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setAuthState({ user, isLoading: false });
      } catch {
        setAuthState({ user: null, isLoading: false });
      }
    } else {
      setAuthState({ user: null, isLoading: false });
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    // Mock validation
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user exists in "database" (localStorage)
    const usersKey = 'nextstep_users';
    const users = JSON.parse(localStorage.getItem(usersKey) || '{}');
    
    if (!users[email]) {
      return { error: 'No account found with this email' };
    }
    
    if (users[email].password !== password) {
      return { error: 'Incorrect password' };
    }

    const user = { email, name: users[email].name };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    setAuthState({ user, isLoading: false });
    return {};
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string): Promise<{ error?: string }> => {
    // Mock validation
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }
    if (!email.includes('@')) {
      return { error: 'Please enter a valid email address' };
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    const usersKey = 'nextstep_users';
    const users = JSON.parse(localStorage.getItem(usersKey) || '{}');
    
    if (users[email]) {
      return { error: 'An account with this email already exists' };
    }

    // Save to "database"
    users[email] = { password, name };
    localStorage.setItem(usersKey, JSON.stringify(users));

    // Auto-login after signup
    const user = { email, name };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    setAuthState({ user, isLoading: false });
    return {};
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setAuthState({ user: null, isLoading: false });
  }, []);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: !!authState.user,
    login,
    signup,
    logout,
  };
}
