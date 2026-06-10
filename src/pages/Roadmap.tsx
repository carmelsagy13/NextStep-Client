import { useState, useEffect } from "react";
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
  UploadCloud,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppNavbar from "@/components/app/AppNavbar";
import RoadmapSteps from "@/components/roadmap/RoadmapSteps";
import FinancialReportUpload from "@/components/FinancialReportUpload";
import BankSyncConnect from "@/components/BankSyncConnect";
import GoalList from "@/components/GoalList";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useRoadmapStore } from "@/store/roadmapStore";
import { getRoadmap } from "@/api/roadmap.api";
import { getGoals } from "@/api/goals.api";
import { getProfile } from "@/api/profile.api";
import { resetAccountData } from "@/api/openfinance.api";
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
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
          setShowUpload(true);
          setPageStatus("ready");
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

        if (loadedState) {
          const idx = (loadedState.currentStepId ?? 1) - 1;
          setCurrentIndex(Math.max(0, Math.min(4, idx)));
        }

        const hasData = !!loadedState || loadedGoals.length > 0;
        setShowUpload(!hasData);
      } catch {
        setShowUpload(true);
      } finally {
        setPageStatus("ready");
      }
    }

    loadData();
  }, [accessToken, hydrate, reset]);

  // After upload/sync success, update index from store
  useEffect(() => {
    if (roadmapState?.currentStepId) {
      const idx = roadmapState.currentStepId - 1;
      setCurrentIndex(Math.max(0, Math.min(4, idx)));
    }
  }, [roadmapState]);

  const handleReset = async () => {
    setResetting(true);
    setShowResetConfirm(false);
    try {
      await resetAccountData();
      reset();
      setShowUpload(true);
    } catch {
      // non-critical
    } finally {
      setResetting(false);
    }
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
  // Compute progress from live goal completion so the ring updates immediately
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

      {/* Upload / no-data state */}
      {showUpload && (
        <main className="flex-1 p-4">
          <div className="max-w-lg mx-auto space-y-6 pt-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold">
                הגדרת המפה שלך
              </h1>
              <p className="text-muted-foreground text-sm">
                חבר את הבנק שלך או העלה דוח Open Finance כדי ליצור את התוכנית
                האישית שלך.
              </p>
            </div>

            <FinancialReportUpload
              onSuccess={() => {
                const updatedState = useRoadmapStore.getState().roadmapState;
                if (updatedState?.currentStepId) {
                  setCurrentIndex(updatedState.currentStepId - 1);
                }
                setShowUpload(false);
              }}
            />

            <div className="relative flex items-center">
              <div className="flex-1 border-t border-border" />
              <span className="px-3 text-xs text-muted-foreground">
                או התחבר ישירות
              </span>
              <div className="flex-1 border-t border-border" />
            </div>

            <BankSyncConnect
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
                <h2 className="font-display text-xl font-bold">
                  {currentStage.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentStage.subtitle}
                </p>
              </div>

              {/* Goals from backend */}
              {goals.length > 0 && <GoalList />}

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

              {/* Re-analyse / reset section */}
              <div className="pt-4 border-t border-border">
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    אפס את הנתונים שלי והתחל מחדש
                  </button>
                ) : (
                  <div className="glass-card p-4 space-y-3 border-destructive/20">
                    <p className="text-sm font-medium text-destructive">
                      פעולה זו תמחק את כל נתוני המפה לצמיתות.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleReset}
                        disabled={resetting}
                      >
                        {resetting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : null}
                        אשר איפוס
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowResetConfirm(false)}
                      >
                        ביטול
                      </Button>
                    </div>
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
