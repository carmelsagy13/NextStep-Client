import apiClient from "./client";
import type { UserProfileHistory } from "../types";

/**
 * Fetch the current user's profile.
 * Returns 404 if the profile has been deleted — the caller should treat this
 * as a signal to clear local state and redirect to onboarding.
 * Cache-busting headers prevent the browser from serving a stale 200 response.
 */
export const getProfile = () =>
  apiClient.get("/profile", {
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
  });

/** Fetch the user's assessment history (abstracted criteria snapshots). */
export const getProfileHistory = () =>
  apiClient.get<UserProfileHistory[]>("/profile/history");

/** Fetch the user's current progress summary. */
export const getProfileProgress = () => apiClient.get("/profile/progress");
