import { useAuthStore } from "./authStore";
import { getProfile } from "../api/profile.api";

/**
 * Single source of truth for the user's financial "current step".
 *
 * The authoritative value lives in the user profile (GET /profile →
 * `currentStep`). All business logic that depends on the user's step
 * (screen gating, which goals/tasks to show, step-isolation checks,
 * progress logic) must read it from here — never from the roadmap state,
 * which is purely visualization.
 */

/** React hook: the authoritative current step (defaults to 1). */
export function useCurrentStep(): number {
  return useAuthStore((s) => s.userProfile?.currentStep ?? 1);
}

/** Imperative getter for use outside React render (defaults to 1). */
export function getCurrentStep(): number {
  return useAuthStore.getState().userProfile?.currentStep ?? 1;
}

/**
 * Refetch GET /profile and store it so the authoritative current step stays
 * in sync — e.g. after a roadmap step change or a data re-analysis.
 * Returns the refreshed step.
 */
export async function refreshCurrentStep(): Promise<number> {
  const res = await getProfile();
  useAuthStore.getState().setUserProfile(res.data);
  return res.data?.currentStep ?? 1;
}
