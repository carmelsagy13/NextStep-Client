import { create } from 'zustand';
import type { RoadmapState, UserGoal, UploadAnalysisResponse } from '../types';

interface RoadmapStore {
  /** Roadmap state returned from the backend after analysis */
  roadmapState: RoadmapState | null;
  /** User goals returned from the backend after analysis */
  goals: UserGoal[];

  /** Hydrate store from a POST /openfinance/upload response */
  setFromUpload: (payload: UploadAnalysisResponse) => void;

  /**
   * Optimistically update a goal's currentAmount in the store.
   * Call this after a successful POST /goals/update so the UI stays
   * in sync with the DB without a full refetch.
   */
  updateGoalProgress: (goalId: string, currentAmount: number) => void;

  /** Clear all analysis state (e.g. on logout) */
  reset: () => void;
}

export const useRoadmapStore = create<RoadmapStore>((set) => ({
  roadmapState: null,
  goals: [],

  setFromUpload: (payload) =>
    set({
      roadmapState: payload.roadmap_state,
      goals: payload.user_goals,
    }),

  updateGoalProgress: (goalId, currentAmount) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.goalId === goalId ? { ...g, currentAmount } : g,
      ),
    })),

  reset: () => set({ roadmapState: null, goals: [] }),
}));
