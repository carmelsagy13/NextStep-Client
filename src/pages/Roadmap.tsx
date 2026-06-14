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
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppNavbar from "@/components/app/AppNavbar";
import RoadmapSteps from "@/components/roadmap/RoadmapSteps";
import DataLoadSection from "@/components/DataLoadSection";
import GoalList from "@/components/GoalList";
import Confetti from "@/components/Confetti";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useRoadmapStore } from "@/store/roadmapStore";
import { getRoadmap } from "@/api/roadmap.api";
import { getGoals } from "@/api/goals.api";
import {
  useCurrentStep,
  getCurrentStep,
  refreshCurrentStep,
} from "@/store/currentStep";
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
    teaser: string;
    highlights: string[];
  }
> = {
  1: {
    name: "יציבות פיננסית",
    subtitle: "בנה את הבסיס שלך",
    icon: Shield,
    teaser:
      "השלב הראשון במסע — יצירת תזרים מזומנים יציב ושליטה מלאה בהוצאות שלך.",
    highlights: [
      "בניית תקציב חודשי ברור",
      "מעקב אחר הכנסות והוצאות",
      "כיסוי כל ההתחייבויות הבסיסיות",
    ],
  },
  2: {
    name: "קרן חירום",
    subtitle: "רשת הביטחון שלך",
    icon: PiggyBank,
    teaser:
      "רשת ביטחון כלכלית שתאפשר לך להתמודד עם הפתעות החיים בלי להיכנס לחובות.",
    highlights: [
      "חיסכון של 3 עד 6 חודשי הוצאות",
      "כסף נזיל וזמין בכל רגע",
      "שקט נפשי מול אירועים בלתי צפויים",
    ],
  },
  3: {
    name: "חופש מחובות",
    subtitle: "סלק חובות בריבית גבוהה",
    icon: CreditCard,
    teaser:
      "סילוק שיטתי של חובות בריבית גבוהה כדי לשחרר את ההכנסה שלך לצמיחה.",
    highlights: [
      "מיפוי כל החובות שלך",
      "סילוק החובות בריבית הגבוהה ביותר תחילה",
      "הפיכת תשלומי הריבית לחיסכון",
    ],
  },
  4: {
    name: "השקע וצמח",
    subtitle: "כנס לשוק",
    icon: TrendingUp,
    teaser:
      "הכסף שלך מתחיל לעבוד בשבילך — כניסה מושכלת לשוק ההון לטווח ארוך.",
    highlights: [
      "בניית תיק השקעות מפוזר",
      "ניצול כוח הריבית הדריבית",
      "השקעה עקבית לאורך זמן",
    ],
  },
  5: {
    name: "בניית עושר",
    subtitle: "עצמאות כלכלית",
    icon: Crown,
    teaser: "השלב המתקדם — בניית עושר משמעותי ועצמאות כלכלית אמיתית.",
    highlights: [
      "אופטימיזציית מס וניהול נכסים",
      "יצירת מקורות הכנסה פסיביים",
      "תכנון עתיד ועיזבון",
    ],
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
  // Authoritative current step — read from GET /profile, never the roadmap state.
  const currentStepId = useCurrentStep();

  const [pageStatus, setPageStatus] = useState<"loading" | "ready">("loading");
  const [showUpload, setShowUpload] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Refresh panel state
  const [showRefreshPanel, setShowRefreshPanel] = useState(false);
  // Reset data state
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  // Progress animation
  const [animatingGoals, setAnimatingGoals] = useState<Set<string>>(new Set());
  const [animatingStage, setAnimatingStage] = useState(false);
  // Celebration confetti (fires on level-up; reusable elsewhere)
  const [showConfetti, setShowConfetti] = useState(false);
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
        // Fetch + store the authoritative profile (source of the current step).
        await refreshCurrentStep();
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

        const idx = getCurrentStep() - 1;
        setCurrentIndex(Math.max(0, Math.min(4, idx)));

        setShowUpload(false);
      } catch {
        setShowUpload(true);
      } finally {
        setPageStatus("ready");
      }
    }

    loadData();
  }, [accessToken, hydrate, reset, navigate]);

  // Sync stage index whenever the authoritative step changes (after refresh)
  useEffect(() => {
    const idx = currentStepId - 1;
    setCurrentIndex(Math.max(0, Math.min(4, idx)));
  }, [currentStepId]);

  // One-off celebration after login (set in Login.tsx) — used to test the
  // confetti effect. Fires once the roadmap is ready, then clears the flag.
  useEffect(() => {
    if (pageStatus !== "ready") return;
    if (sessionStorage.getItem("nextstep:celebrate") === "1") {
      sessionStorage.removeItem("nextstep:celebrate");
      setShowConfetti(true);
    }
  }, [pageStatus]);

  /** Called when the refresh panel successfully loads new data. */
  const handleRefreshSuccess = async () => {
    // Re-analysis may advance the user's step — refetch the authoritative
    // profile step before comparing against the pre-refresh snapshot.
    const newStepId = await refreshCurrentStep();
    const store = useRoadmapStore.getState();
    const newGoals = store.goals;

    const snap = preRefreshSnapshot.current;
    if (snap) {
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
        setShowConfetti(true);
        setTimeout(() => setAnimatingStage(false), 2500);
      }
    }

    setShowRefreshPanel(false);
  };

  /** Capture state snapshot before opening the refresh panel. */
  const openRefreshPanel = () => {
    const store = useRoadmapStore.getState();
    const state = store.roadmapState;
    const goals = store.goals;
    preRefreshSnapshot.current = {
      stepId: getCurrentStep(),
      progressPercent: state?.progressPercent ?? 0,
      completedGoalIds: new Set(
        goals
          .filter((g) => g.status === UserGoalStatus.COMPLETED)
          .map((g) => g.goalId),
      ),
    };
    setShowRefreshPanel((prev) => !prev);
  };

  /** Wipe all financial data and return to the setup flow. */
  const handleResetData = async () => {
    if (resetting) return;
    const confirmed = window.confirm(
      "פעולה זו תמחק לצמיתות את כל הנתונים הפיננסיים שלך (מפה, יעדים והיסטוריה). פרטי החשבון שלך יישמרו. להמשיך?",
    );
    if (!confirmed) return;
    setResetting(true);
    setResetError("");
    try {
      await resetAccountData();
      reset(); // clear local store
      navigate("/setup", { replace: true });
    } catch {
      setResetError("האיפוס נכשל. נסה שוב.");
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

  // Build stages for the visual component. The current step is the
  // authoritative profile value resolved via useCurrentStep() above.
  const completedGoals = goals.filter(
    (g: UserGoal) => g.status === UserGoalStatus.COMPLETED,
  ).length;
  // Prefer the backend's `progress_percents` value from the roadmap_states
  // table (resilient to snake_case / plural serialisation). Fall back to a
  // goal-based estimate only when the state has no progress value.
  const statePercent =
    roadmapState?.progressPercent ??
    roadmapState?.progressPercents ??
    roadmapState?.progress_percents ??
    roadmapState?.progress_percent;
  const progressPercent =
    statePercent != null
      ? Math.max(0, Math.min(100, statePercent))
      : goals.length > 0
        ? Math.round((completedGoals / goals.length) * 100)
        : 0;
  const financialStages = buildStages(currentStepId, progressPercent);
  const currentStage = financialStages[currentIndex];

  // The stage the user is currently *viewing* on the map (may differ from
  // their actual current stage).
  const selectedStepId = currentIndex + 1;
  const selectedMeta = STEP_LABELS[selectedStepId];
  const StageIcon = selectedMeta?.icon ?? Shield;
  const isCurrentStage = currentStage.status === "active";
  const isCompletedStage = currentStage.status === "completed";
  const isLockedStage = currentStage.status === "locked";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Confetti fire={showConfetti} onComplete={() => setShowConfetti(false)} />
      <AppNavbar />

      {/* Fallback upload state (e.g. if API fails at load time) */}
      {showUpload && (
        <main className="flex-1 p-4">
          <div className="max-w-lg mx-auto space-y-6 pt-4">
            <DataLoadSection
              title="הגדרת המפה שלך"
              subtitle="חבר את הבנק שלך או העלה דוח Open Finance כדי ליצור את התוכנית האישית שלך."
              onSuccess={async () => {
                const step = await refreshCurrentStep();
                setCurrentIndex(Math.max(0, Math.min(4, step - 1)));
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
              {/* Stage description — only for the user's current stage */}
              {isCurrentStage && roadmapState?.stateDescription && (
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

              {/* Current stage — active goals to work on */}
              {isCurrentStage && (
                <GoalList
                  stepId={selectedStepId}
                  currentStepId={currentStepId}
                  mode="current"
                  animatingGoalIds={animatingGoals}
                />
              )}

              {/* Completed stage — shown at 100% with the past tasks */}
              {isCompletedStage && (
                <>
                  <div
                    className="rounded-2xl border border-primary/20 bg-primary/5 p-4"
                    dir="rtl"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        <p className="font-medium text-primary">שלב הושלם</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        100%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <GoalList
                    stepId={selectedStepId}
                    currentStepId={currentStepId}
                    mode="past"
                    title="המשימות שהשלמת"
                  />
                </>
              )}

              {/* Future / locked stage — enticing preview, no tasks */}
              {isLockedStage && selectedMeta && (
                <div
                  className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/40 to-background p-6 text-center"
                  dir="rtl"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                    <StageIcon className="h-7 w-7 text-primary" />
                  </div>

                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    שלב נעול
                  </div>

                  <h3 className="font-display text-lg font-bold">
                    {selectedMeta.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {selectedMeta.teaser}
                  </p>

                  <div className="mt-5 space-y-2.5 text-right">
                    {selectedMeta.highlights.map((highlight, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 rounded-xl border border-border bg-background/60 px-3 py-2"
                      >
                        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                        <span className="text-sm text-foreground">
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 text-xs text-muted-foreground">
                    השלם את השלבים הקודמים כדי לפתוח את השלב הזה ולהתחיל לצמוח 🚀
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

                    {/* Test confetti */}
                    <div className="pt-3 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowConfetti(true)}
                        className="w-full flex items-center gap-2 text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        בדיקת קונפטי
                      </Button>
                    </div>

                    {/* Reset all data */}
                    <div className="pt-3 border-t border-border space-y-2">
                      <p className="text-xs text-muted-foreground">
                        רוצה להתחיל מחדש? פעולה זו תמחק לצמיתות את כל הנתונים
                        הפיננסיים שלך (מפה, יעדים והיסטוריה).
                      </p>
                      {resetError && (
                        <p className="text-xs text-destructive">{resetError}</p>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleResetData}
                        disabled={resetting}
                        className="w-full flex items-center gap-2 text-xs"
                      >
                        {resetting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        אפס נתונים
                      </Button>
                    </div>

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
