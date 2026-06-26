import { create } from "zustand";
import type { RoadmapState, UserGoal } from "../types";
import { UserGoalStatus } from "../types";

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
      goals: state.goals.map((g) =>
        g.goalId === goalId
          ? {
              ...g,
              currentAmount,
              status:
                g.targetAmount != null &&
                Number(g.targetAmount) > 0 &&
                currentAmount >= Number(g.targetAmount)
                  ? UserGoalStatus.COMPLETED
                  : g.status,
            }
          : g,
      ),
    })),

  markGoalComplete: (goalId) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.goalId === goalId
          ? {
              ...g,
              status: UserGoalStatus.COMPLETED,
              completedAt: new Date().toISOString(),
            }
          : g,
      ),
    })),

  reset: () => set({ roadmapState: null, goals: [] }),
}));
