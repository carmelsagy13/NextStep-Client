import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Crown,
  Check,
  Lock,
  Loader2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppNavbar from "@/components/app/AppNavbar";
import RoadmapSteps from "@/components/roadmap/RoadmapSteps";
import DataLoadSection from "@/components/DataLoadSection";
import GoalList from "@/components/GoalList";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useRoadmapStore } from "@/store/roadmapStore";
import { getRoadmap } from "@/api/roadmap.api";
import { getGoals } from "@/api/goals.api";
import { getProfile } from "@/api/profile.api";
import { UserGoalStatus } from "@/types";
import type { RoadmapState, UserGoal } from "@/types";

// Step labels matching the backend's 5-stage hierarchy
const STEP_LABELS: Record<
  number,
  {
    name: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  1: {
    name: "יציבות פיננסית",
    subtitle: "בנה את הבסיס שלך",
    icon: Shield,
  },
  2: { name: "קרן חירום", subtitle: "רשת הביטחון שלך", icon: PiggyBank },
  3: {
    name: "חופש מחובות",
    subtitle: "סלק חובות בריבית גבוהה",
    icon: CreditCard,
  },
  4: { name: "השקע וצמח", subtitle: "כנס לשוק", icon: TrendingUp },
  5: {
    name: "בניית עושר",
    subtitle: "עצמאות כלכלית",
    icon: Crown,
  },
};

/** Build the `financialStages` array that RoadmapSteps expects from live API data. */
function buildStages(currentStepId: number, progressPercent: number) {
  return [1, 2, 3, 4, 5].map((stepId) => {
    const meta = STEP_LABELS[stepId] ?? {
      name: `שלב ${stepId}`,
      subtitle: "",
      icon: Shield,
    };
    const isCompleted = stepId < currentStepId;
    const isActive = stepId === currentStepId;
    return {
      id: stepId,
      name: meta.name,
      subtitle: meta.subtitle,
      icon: meta.icon,
      color: isActive
        ? "from-primary to-primary/80"
        : isCompleted
          ? "from-primary to-emerald-500"
          : "from-muted to-muted/80",
      bgColor: isActive || isCompleted ? "bg-primary" : "bg-muted",
      description: "",
      tasks: [] as { title: string; completed: boolean }[],
      status: isCompleted ? "completed" : isActive ? "active" : "locked",
      progress: isCompleted ? 100 : isActive ? progressPercent : 0,
      lossAmount: null as string | null,
    };
  });
}

const Roadmap = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { accessToken } = useAuthStore();
  const { hydrate, reset, roadmapState, goals } = useRoadmapStore();

  const [pageStatus, setPageStatus] = useState<"loading" | "ready">("loading");
  const [showUpload, setShowUpload] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Refresh panel state
  const [showRefreshPanel, setShowRefreshPanel] = useState(false);
  // Progress animation
  const [animatingGoals, setAnimatingGoals] = useState<Set<string>>(new Set());
  const [animatingStage, setAnimatingStage] = useState(false);
  // Snapshot taken before each refresh so we can detect changes afterwards
  const preRefreshSnapshot = useRef<{
    stepId: number;
    progressPercent: number;
    completedGoalIds: Set<string>;
  } | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Load data on mount
  useEffect(() => {
    if (!accessToken) return;

    async function loadData() {
      try {
        await getProfile();
      } catch (err) {
        const status = (err as { response?: { status?: number } }).response
          ?.status;
        if (status === 404) {
          reset();
          // No profile → redirect to setup flow
          navigate("/setup", { replace: true });
          return;
        }
      }

      try {
        const [roadmapRes, goalsRes] = await Promise.all([
          getRoadmap(),
          getGoals(),
        ]);
        const loadedState: RoadmapState | null = roadmapRes.data?.state ?? null;
        const loadedGoals: UserGoal[] = Array.isArray(goalsRes.data)
          ? goalsRes.data
          : [];
        hydrate(loadedState, loadedGoals);

        const hasData = !!loadedState || loadedGoals.length > 0;
        if (!hasData) {
          navigate("/setup", { replace: true });
          return;
        }

        if (loadedState) {
          const idx = (loadedState.currentStepId ?? 1) - 1;
          setCurrentIndex(Math.max(0, Math.min(4, idx)));
        }

        setShowUpload(false);
      } catch {
        setShowUpload(true);
      } finally {
        setPageStatus("ready");
      }
    }

    loadData();
  }, [accessToken, hydrate, reset, navigate]);

  // Sync stage index whenever roadmapState changes (after refresh)
  useEffect(() => {
    if (roadmapState?.currentStepId) {
      const idx = roadmapState.currentStepId - 1;
      setCurrentIndex(Math.max(0, Math.min(4, idx)));
    }
  }, [roadmapState]);

  /** Called when the refresh panel successfully loads new data. */
  const handleRefreshSuccess = () => {
    const store = useRoadmapStore.getState();
    const newState = store.roadmapState;
    const newGoals = store.goals;

    const snap = preRefreshSnapshot.current;
    if (snap && newState) {
      const newStepId = newState.currentStepId ?? 1;
      const newCompleted = new Set(
        newGoals
          .filter((g) => g.status === UserGoalStatus.COMPLETED)
          .map((g) => g.goalId),
      );

      // Detect newly completed goals
      const newlyCompleted = newGoals
        .filter(
          (g) =>
            g.status === UserGoalStatus.COMPLETED &&
            !snap.completedGoalIds.has(g.goalId),
        )
        .map((g) => g.goalId);

      if (newlyCompleted.length > 0) {
        setAnimatingGoals(new Set(newlyCompleted));
        setTimeout(() => setAnimatingGoals(new Set()), 2000);
      }

      // Detect step advancement
      if (newStepId > snap.stepId) {
        setAnimatingStage(true);
        setTimeout(() => setAnimatingStage(false), 2500);
      }

      void newCompleted; // suppress unused warning
    }

    setShowRefreshPanel(false);
  };

  /** Capture state snapshot before opening the refresh panel. */
  const openRefreshPanel = () => {
    const store = useRoadmapStore.getState();
    const state = store.roadmapState;
    const goals = store.goals;
    preRefreshSnapshot.current = {
      stepId: state?.currentStepId ?? 1,
      progressPercent: state?.progressPercent ?? 0,
      completedGoalIds: new Set(
        goals
          .filter((g) => g.status === UserGoalStatus.COMPLETED)
          .map((g) => g.goalId),
      ),
    };
    setShowRefreshPanel((prev) => !prev);
  };

  if (!isAuthenticated) return null;

  if (pageStatus === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            טוען את הפרופיל שלך...
          </p>
        </div>
      </div>
    );
  }

  const hasData = !!roadmapState || goals.length > 0;

  // Build stages for the visual component
  const currentStepId = roadmapState?.currentStepId ?? 1;
  const completedGoals = goals.filter(
    (g: UserGoal) => g.status === UserGoalStatus.COMPLETED,
  ).length;
  const progressPercent =
    goals.length > 0
      ? Math.round((completedGoals / goals.length) * 100)
      : (roadmapState?.progressPercent ?? 0);
  const financialStages = buildStages(currentStepId, progressPercent);
  const currentStage = financialStages[currentIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />

      {/* Fallback upload state (e.g. if API fails at load time) */}
      {showUpload && (
        <main className="flex-1 p-4">
          <div className="max-w-lg mx-auto space-y-6 pt-4">
            <DataLoadSection
              title="הגדרת המפה שלך"
              subtitle="חבר את הבנק שלך או העלה דוח Open Finance כדי ליצור את התוכנית האישית שלך."
              onSuccess={() => {
                const updatedState = useRoadmapStore.getState().roadmapState;
                if (updatedState?.currentStepId) {
                  setCurrentIndex(updatedState.currentStepId - 1);
                }
                setShowUpload(false);
              }}
            />
          </div>
        </main>
      )}

      {/* Roadmap view */}
      {!showUpload && hasData && (
        <main className="flex-1 flex flex-col">
          {/* Road steps visualization */}
          <div className="flex-shrink-0 pt-4 pb-2 overflow-hidden">
            <RoadmapSteps
              stages={financialStages}
              currentIndex={currentIndex}
              onStageSelect={setCurrentIndex}
            />
          </div>

          {/* Tasks / Goals section */}
          <div
            className="flex-1 bg-muted/30 rounded-t-3xl border-t border-border px-6 pt-6 pb-8 mt-4"
            dir="rtl"
          >
            <div className="max-w-sm mx-auto space-y-5">
              {/* Stage description */}
              {roadmapState?.stateDescription && (
                <div className="glass-card p-4">
                  <p className="text-sm text-muted-foreground">
                    {roadmapState.stateDescription}
                  </p>
                </div>
              )}

              {/* Stage meta */}
              <div>
                <h2
                  className={`font-display text-xl font-bold transition-all duration-700 ${
                    animatingStage
                      ? "text-primary scale-105 animate-stage-pulse"
                      : ""
                  }`}
                >
                  {currentStage.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentStage.subtitle}
                </p>
              </div>

              {/* Goals from backend */}
              {goals.length > 0 && (
                <GoalList animatingGoalIds={animatingGoals} />
              )}

              {/* Empty state for locked stage */}
              {currentStage.status === "locked" && (
                <div className="text-center p-6 rounded-2xl bg-muted/50 border border-border">
                  <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="font-medium text-muted-foreground">שלב נעול</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    השלם שלבים קודמים כדי לפתוח את זה.
                  </p>
                </div>
              )}

              {/* Completed stage badge */}
              {currentStage.status === "completed" && (
                <div className="text-center p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <Check className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-medium text-primary">שלב הושלם!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    כל הכבוד — השלב הבא מחכה לך.
                  </p>
                </div>
              )}

              {/* ── Refresh section ── */}
              <div className="pt-4 border-t border-border space-y-3">
                <button
                  onClick={openRefreshPanel}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  רענן נתונים
                  {showRefreshPanel ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                {/* Inline collapsible refresh panel */}
                {showRefreshPanel && (
                  <div className="glass-card p-4 space-y-4 animate-fade-in">
                    <p className="text-xs text-muted-foreground">
                      העלה נתונים מעודכנים — ה-LLM יריץ ניתוח מחדש וישמר את
                      ההתקדמות הקיימת שלך.
                    </p>
                    <DataLoadSection onSuccess={handleRefreshSuccess} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRefreshPanel(false)}
                      className="w-full text-xs"
                    >
                      סגור
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Roadmap;
