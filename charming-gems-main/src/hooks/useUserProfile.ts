import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types/userProfile';

const STORAGE_KEY = 'nextstep_user_profile';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored profile:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const saveProfile = (newProfile: UserProfile) => {
    const profileWithTimestamp = {
      ...newProfile,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profileWithTimestamp));
    setProfile(profileWithTimestamp);
  };

  const updatePartialProfile = (partial: Partial<UserProfile>) => {
    const updated = { ...profile, ...partial } as UserProfile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProfile(updated);
  };

  const clearProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  };

  const hasCompletedQuestionnaire = Boolean(profile?.completedAt);

  return {
    profile,
    isLoading,
    saveProfile,
    updatePartialProfile,
    clearProfile,
    hasCompletedQuestionnaire,
  };
}
