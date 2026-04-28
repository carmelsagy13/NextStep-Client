import apiClient from './client';

/**
 * Fetch the current user's profile.
 * Returns 404 if the profile has been deleted — the caller should treat this
 * as a signal to clear local state and redirect to onboarding.
 * Cache-busting headers prevent the browser from serving a stale 200 response.
 */
export const getProfile = () =>
  apiClient.get('/profile', {
    headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' },
  });
