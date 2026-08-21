import { create } from "zustand";
import type { GoalDismissalReason, RoadmapState, UserGoal } from "../types";
import { UserGoalStatus } from "../types";
import { getCurrentStep } from "./currentStep";

// Accept both snake_case (defined in UploadAnalysisResponse) and camelCase
// variants so the store is resilient to either backend serialisation format.
type UploadPayload = {
  roadmap_state?: RoadmapState | null;
  roadmapState?: RoadmapState | null;
  user_goals?: UserGoal[];
  userGoals?: UserGoal[];
};

interface RoadmapStore {
  /** Roadmap state returned from the backend after analysis */
  roadmapState: RoadmapState | null;
  /** User goals returned from the backend after analysis */
  goals: UserGoal[];

  /** Hydrate store from initial page load (GET /roadmap + GET /goals) */
  hydrate: (roadmapState: RoadmapState | null, goals: UserGoal[]) => void;

  /**
   * Replace just the goals list (e.g. after re-fetching GET /goals once the
   * server re-synced roadmap tasks following an aspiration change).
   */
  setGoals: (goals: UserGoal[]) => void;

  /** Hydrate store from a POST /openfinance/upload response */
  setFromUpload: (payload: UploadPayload) => void;

  /**
   * Optimistically update a goal's currentAmount in the store.
   * Call this after a successful POST /goals/update so the UI stays
   * in sync with the DB without a full refetch.
   */
  updateGoalProgress: (goalId: string, currentAmount: number) => void;

  /**
   * Mark a goal as completed in the store.
   * Call this only after a successful POST /goals/update with status: 'completed'.
   */
  markGoalComplete: (goalId: string) => void;

  /**
   * Set a goal's status directly (e.g. toggling a task between COMPLETED and
   * ACTIVE from the task card). Manages `completedAt`/`completedAtStep`
   * accordingly.
   */
  setGoalStatus: (goalId: string, status: UserGoalStatus) => void;

  /**
   * Mirror of POST /goals/dismiss: retires a task and records why the user
   * rejected it, so the dismissed list renders without waiting for a refetch.
   */
  markGoalDismissed: (
    goalId: string,
    reason: GoalDismissalReason,
    note?: string,
  ) => void;

  /**
   * Mirror of POST /goals/snooze: defers a task to `snoozedUntil`, or brings it
   * back when passed null. The status is untouched, as on the server.
   */
  setGoalSnooze: (goalId: string, snoozedUntil: string | null) => void;

  /** Clear all analysis state (e.g. on logout) */
  reset: () => void;
}

export const useRoadmapStore = create<RoadmapStore>((set) => ({
  roadmapState: null,
  goals: [],

  hydrate: (roadmapState, goals) => set({ roadmapState, goals }),

  setGoals: (goals) => set({ goals }),

  setFromUpload: (payload) =>
    set({
      roadmapState: payload.roadmap_state ?? payload.roadmapState ?? null,
      goals: payload.user_goals ?? payload.userGoals ?? [],
    }),

  updateGoalProgress: (goalId, currentAmount) =>
    set((state) => ({
      goals: state.goals.map((g) => {
        if (g.goalId !== goalId) return g;
        const reachedTarget =
          g.targetAmount != null &&
          Number(g.targetAmount) > 0 &&
          currentAmount >= Number(g.targetAmount);
        if (!reachedTarget) return { ...g, currentAmount };
        return {
          ...g,
          currentAmount,
          status: UserGoalStatus.COMPLETED,
          completedAt: g.completedAt ?? new Date().toISOString(),
          completedAtStep: g.completedAtStep ?? getCurrentStep(),
        };
      }),
    })),

  markGoalComplete: (goalId) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.goalId === goalId
          ? {
              ...g,
              status: UserGoalStatus.COMPLETED,
              completedAt: g.completedAt ?? new Date().toISOString(),
              completedAtStep: g.completedAtStep ?? getCurrentStep(),
            }
          : g,
      ),
    })),

  setGoalStatus: (goalId, status) =>
    set((state) => ({
      goals: state.goals.map((g) => {
        if (g.goalId !== goalId) return g;
        const completed = status === UserGoalStatus.COMPLETED;
        const reactivated = status === UserGoalStatus.ACTIVE;
        return {
          ...g,
          status,
          completedAt: completed
            ? (g.completedAt ?? new Date().toISOString())
            : null,
          completedAtStep: completed
            ? (g.completedAtStep ?? getCurrentStep())
            : null,
          // Any lifecycle move settles the task, so a pending deferral is moot.
          snoozedUntil: null,
          // The server drops the feedback when the user reactivates a task.
          dismissalReason: reactivated ? null : g.dismissalReason,
          dismissalNote: reactivated ? null : g.dismissalNote,
          dismissedAt: reactivated ? null : g.dismissedAt,
        };
      }),
    })),

  markGoalDismissed: (goalId, reason, note) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.goalId === goalId
          ? {
              ...g,
              status: UserGoalStatus.ABANDONED,
              dismissalReason: reason,
              dismissalNote: note ?? null,
              dismissedAt: new Date().toISOString(),
              snoozedUntil: null,
            }
          : g,
      ),
    })),

  setGoalSnooze: (goalId, snoozedUntil) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.goalId === goalId ? { ...g, snoozedUntil } : g,
      ),
    })),

  reset: () => set({ roadmapState: null, goals: [] }),
}));
