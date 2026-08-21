import { useState, useEffect, useRef, useCallback } from "react";
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
  AlertTriangle,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppNavbar from "@/components/app/AppNavbar";
import RoadmapSteps from "@/components/roadmap/RoadmapSteps";
import DataLoadSection from "@/components/DataLoadSection";
import DemoLoadingModal from "@/components/DemoLoadingModal";
import GoalList from "@/components/GoalList";
import Confetti from "@/components/Confetti";
import StairsLoader from "@/components/StairsLoader";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useRoadmapStore } from "@/store/roadmapStore";
import { triggerDemo } from "@/api/demo.api";
import { getRoadmap } from "@/api/roadmap.api";
import { getGoals } from "@/api/goals.api";
import {
  useCurrentStep,
  getCurrentStep,
  refreshCurrentStep,
} from "@/store/currentStep";
import { resetAccountData, connectBankApi } from "@/api/openfinance.api";
import { formatMoney } from "@/lib/utils";
import { goalStepId } from "@/lib/goalStep";
import { UserGoalStatus } from "@/types";
import type { LossAversion, RoadmapState, RoadmapStep, UserGoal } from "@/types";

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
function buildStages(
  currentStepId: number,
  progressPercent: number,
  apiSteps?: RoadmapStep[],
  lossAversion?: LossAversion | null,
) {
  return [1, 2, 3, 4, 5].map((stepId) => {
    const meta = STEP_LABELS[stepId] ?? {
      name: `שלב ${stepId}`,
      subtitle: "",
      icon: Shield,
    };
    // Find matching API step to get titleHe if available
    const apiStep = apiSteps?.find((s) => s.stepId === stepId);
    const name = apiStep?.titleHe ?? meta.name;

    const isCompleted = stepId < currentStepId;
    const isActive = stepId === currentStepId;
    // Attach the loss aversion nudge only to the stage it targets, and only
    // when there's a positive monthly loss to show.
    const stageLoss =
      lossAversion &&
      lossAversion.nextStepId === stepId &&
      lossAversion.annualLossAmount > 0
        ? lossAversion
        : null;
    return {
      id: stepId,
      name,
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
      lossAversion: stageLoss,
    };
  });
}

const Roadmap = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { accessToken } = useAuthStore();
  // Backend-driven Demo Mode flag (set on login/register).
  const demoMode = useAuthStore((s) => s.demoMode);
  const { hydrate, reset, roadmapState, goals, setFromUpload, setGoals } =
    useRoadmapStore();
  // Authoritative current step — read from GET /profile, never the roadmap state.
  const currentStepId = useCurrentStep();

  const [pageStatus, setPageStatus] = useState<"loading" | "ready">("loading");
  const [showUpload, setShowUpload] = useState(false);
  // Demo Mode: automated generation state
  const [demoGenerating, setDemoGenerating] = useState(false);
  const [demoError, setDemoError] = useState("");
  const demoTriggered = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [apiSteps, setApiSteps] = useState<RoadmapStep[] | undefined>();

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

  // Re-analysis offered once the user checks off every task on their step.
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [dismissedCompletion, setDismissedCompletion] = useState<string | null>(
    null,
  );

  const currentStepGoals = goals.filter(
    (g) =>
      (g.status === UserGoalStatus.ACTIVE ||
        g.status === UserGoalStatus.COMPLETED) &&
      goalStepId(g, currentStepId) === currentStepId,
  );
  const allCurrentStepGoalsDone =
    currentStepGoals.length > 0 &&
    currentStepGoals.every((g) => g.status === UserGoalStatus.COMPLETED);
  // Identifies this exact set of finished tasks, so the prompt is offered once
  // per set instead of returning on every refetch.
  const completionSignature = currentStepGoals
    .map((g) => g.goalId)
    .sort()
    .join("|");
  const showStepCompletePrompt =
    allCurrentStepGoalsDone && dismissedCompletion !== completionSignature;

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
        if (status === 404 && !demoMode) {
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
        // The loss aversion nudge is returned both at the top level and nested
        // inside `state`. Merge the top-level copy in as a fallback so the UI
        // works regardless of which one the backend populates.
        if (loadedState && loadedState.lossAversion == null && roadmapRes.data?.lossAversion) {
          loadedState.lossAversion = roadmapRes.data.lossAversion;
        }
        // TEMP diagnostic — confirm whether the backend is returning the
        // loss aversion payload after login/logout.
        console.log("[Roadmap.loadData] lossAversion:", {
          topLevel: roadmapRes.data?.lossAversion,
          nested: roadmapRes.data?.state?.lossAversion,
          merged: loadedState?.lossAversion,
        });
        const loadedSteps: RoadmapStep[] = Array.isArray(roadmapRes.data?.steps)
          ? roadmapRes.data.steps
          : [];
        const loadedGoals: UserGoal[] = Array.isArray(goalsRes.data)
          ? goalsRes.data
          : [];
        setApiSteps(loadedSteps);
        hydrate(loadedState, loadedGoals);

        const hasData = !!loadedState || loadedGoals.length > 0;
        // In Demo Mode we auto-generate the roadmap on entry, so don't bounce
        // to the setup flow when there's no data yet.
        if (!hasData && !demoMode) {
          navigate("/setup", { replace: true });
          return;
        }

        const idx = getCurrentStep() - 1;
        setCurrentIndex(Math.max(0, Math.min(4, idx)));

        setShowUpload(false);
      } catch {
        // In Demo Mode the manual fallback panel is hidden; the demo generation
        // flow (below) handles producing the roadmap instead.
        setShowUpload(!demoMode);
      } finally {
        setPageStatus("ready");
      }
    }

    loadData();
  }, [accessToken, hydrate, reset, navigate, demoMode]);

  // Demo Mode fallback: the login/register call normally runs the demo pipeline
  // server-side and returns the data inline. This only fires as a safety net —
  // if we land on the roadmap in Demo Mode with no data yet — by calling the
  // standalone POST /demo/trigger and showing the loading modal meanwhile.
  const runDemoTrigger = useCallback(async () => {
    setDemoGenerating(true);
    setDemoError("");
    try {
      const { data } = await triggerDemo();

      if (data.mode === "full") {
        // First run (no profile yet): the backend ran the full Open Finance
        // + LLM pipeline. Persist the fresh output so the roadmap and goals
        // render reactively as soon as the modal closes.
        setFromUpload(data.full);
        // Refetch the roadmap steps so freshly-generated step titles (which
        // weren't available on the pre-generation load) render correctly.
        try {
          const roadmapRes = await getRoadmap();
          const loadedSteps: RoadmapStep[] = Array.isArray(
            roadmapRes.data?.steps,
          )
            ? roadmapRes.data.steps
            : [];
          setApiSteps(loadedSteps);
          // The demo/upload `roadmap_state` may not carry the loss aversion
          // nudge — backfill it from the fresh GET /roadmap response (top-level
          // or nested) so the bubble renders after generation.
          const freshLoss =
            roadmapRes.data?.lossAversion ??
            roadmapRes.data?.state?.lossAversion ??
            null;
          if (freshLoss) {
            const store = useRoadmapStore.getState();
            if (store.roadmapState && store.roadmapState.lossAversion == null) {
              useRoadmapStore.setState({
                roadmapState: {
                  ...store.roadmapState,
                  lossAversion: freshLoss,
                },
              });
            }
          }
        } catch {
          // Non-critical — fall back to the built-in step labels.
        }
        const step = await refreshCurrentStep();
        setCurrentIndex(Math.max(0, Math.min(4, step - 1)));
        setShowUpload(false);
      } else {
        // Subsequent run: lightweight aspiration sync — silently refresh the
        // task list (and authoritative step) without navigating.
        const [goalsRes, step] = await Promise.all([
          getGoals(),
          refreshCurrentStep(),
        ]);
        const refreshedGoals: UserGoal[] = Array.isArray(goalsRes.data)
          ? goalsRes.data
          : [];
        setGoals(refreshedGoals);
        setCurrentIndex(Math.max(0, Math.min(4, step - 1)));
      }
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setDemoError(
        error.response?.data?.message ??
          error.message ??
          "אירעה שגיאה בעת יצירת המפה שלך. אנא נסה שוב מאוחר יותר.",
      );
    } finally {
      setDemoGenerating(false);
    }
  }, [setFromUpload, setGoals]);

  useEffect(() => {
    if (!demoMode || !accessToken || demoTriggered.current) return;
    // Wait for the initial load to settle before deciding whether a fallback
    // generation is needed.
    if (pageStatus !== "ready") return;
    const hasData = !!roadmapState || goals.length > 0;
    if (hasData) return; // login already produced the roadmap — nothing to do.
    demoTriggered.current = true;
    runDemoTrigger();
  }, [accessToken, demoMode, pageStatus, roadmapState, goals, runDemoTrigger]);

  /** Retry the demo generation after a failure (from the error screen). */
  const handleDemoRetry = () => {
    demoTriggered.current = true;
    runDemoTrigger();
  };

  // Sync stage index whenever the authoritative step changes (after refresh)
  useEffect(() => {
    const idx = currentStepId - 1;
    setCurrentIndex(Math.max(0, Math.min(4, idx)));
  }, [currentStepId]);

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

  /**
   * Re-runs the Open Finance analysis after every task on the step is done, so
   * the backend can reassess and possibly advance the user. Same call the manual
   * bank-sync button makes.
   */
  const runStepCompleteSync = async () => {
    if (syncing) return;
    setSyncError("");

    const store = useRoadmapStore.getState();
    preRefreshSnapshot.current = {
      stepId: getCurrentStep(),
      progressPercent: store.roadmapState?.progressPercent ?? 0,
      completedGoalIds: new Set(
        store.goals
          .filter((g) => g.status === UserGoalStatus.COMPLETED)
          .map((g) => g.goalId),
      ),
    };

    setSyncing(true);
    try {
      const { data } = await connectBankApi();

      if (data.stage === "CONNECTION_REQUIRED") {
        window.open(data.connectionUrl, "_blank", "noopener,noreferrer");
        setSyncError(
          "נדרש אישור מהבנק — השלם את החיבור בחלון שנפתח ואז נסה שוב.",
        );
        return;
      }

      setFromUpload(data.analysis);
      await handleRefreshSuccess();
      // Offer this set only once, even if the reassessment left it unchanged.
      setDismissedCompletion(completionSignature);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setSyncError(
        error.response?.data?.message ??
          error.message ??
          "עדכון הנתונים נכשל. אנא נסה שוב מאוחר יותר.",
      );
    } finally {
      setSyncing(false);
    }
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
          <StairsLoader size="lg" className="text-primary" />
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
  const financialStages = buildStages(
    currentStepId,
    progressPercent,
    apiSteps,
    roadmapState?.lossAversion,
  );
  const currentStage = financialStages[currentIndex];

  // The stage the user is currently *viewing* on the map (may differ from
  // their actual current stage).
  const selectedStepId = currentIndex + 1;
  const selectedMeta = STEP_LABELS[selectedStepId];
  const StageIcon = selectedMeta?.icon ?? Shield;
  const isCurrentStage = currentStage.status === "active";
  const isCompletedStage = currentStage.status === "completed";
  const isLockedStage = currentStage.status === "locked";

  // Loss aversion figures for the viewed stage. The backend may only populate
  // the annual amount, so derive the monthly figure from it when missing.
  const stageLoss = currentStage.lossAversion;
  const monthlyLoss =
    stageLoss && Number.isFinite(stageLoss.monthlyLossAmount)
      ? stageLoss.monthlyLossAmount
      : stageLoss
        ? stageLoss.annualLossAmount / 12
        : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Confetti fire={showConfetti} onComplete={() => setShowConfetti(false)} />
      {/* Demo Mode: automated LLM generation loading overlay */}
      <DemoLoadingModal open={demoGenerating} errorMsg={demoError} />
      <DemoLoadingModal open={syncing} />
      <AppNavbar />

      {/* Demo Mode error state — shown instead of a blank page when the
          automated generation fails and there's no roadmap to display. */}
      {demoMode && !demoGenerating && demoError && !hasData && (
        <main className="flex-1 p-4" dir="rtl">
          <div className="max-w-md mx-auto pt-12">
            <div className="glass-card p-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display text-xl font-bold">משהו השתבש</h2>
                <p className="text-sm text-muted-foreground">
                  לא הצלחנו ליצור את המפה הפיננסית שלך כרגע. אנא נסה שוב מאוחר
                  יותר.
                </p>
              </div>
              <Button
                onClick={handleDemoRetry}
                className="w-full flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                נסה שוב
              </Button>
            </div>
          </div>
        </main>
      )}

      {/* Fallback upload state (e.g. if API fails at load time). Hidden in
          Demo Mode, where generation is fully automated. */}
      {showUpload && !demoMode && (
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

              {/* Current stage — active goals plus what's already been done */}
              {isCurrentStage && (
                <GoalList
                  stepId={selectedStepId}
                  currentStepId={currentStepId}
                  mode="all"
                  animatingGoalIds={animatingGoals}
                />
              )}

              {/* Every task on the step is done — offer a reassessment */}
              {isCurrentStage && showStepCompletePrompt && (
                <div
                  className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-4"
                  dir="rtl"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 shrink-0 text-primary" />
                    <p className="text-base font-bold leading-snug text-primary">
                      סיימת את כל המשימות בשלב הזה!
                    </p>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    נעדכן את הנתונים מהבנק ונבדוק אם אפשר להעלות אותך שלב.
                  </p>
                  {syncError && (
                    <p className="mb-3 text-sm text-destructive" role="alert">
                      {syncError}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={runStepCompleteSync}
                      disabled={syncing}
                      className="gap-2"
                    >
                      {syncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      עדכון הנתונים שלי
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSyncError("");
                        setDismissedCompletion(completionSignature);
                      }}
                      disabled={syncing}
                    >
                      לא עכשיו
                    </Button>
                  </div>
                </div>
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
                  {/* Idle-money opportunity callout — mirrors the map bubble
                      headline, then expands with the full explanation so the
                      user who clicked through understands it's potential, not
                      a loss. */}
                  {currentStage.lossAversion && (
                    <div className="mb-5 rounded-2xl border-2 border-warning/40 bg-warning/5 p-4 text-right">
                      <div className="mb-2 flex items-center justify-end gap-2">
                        <p className="text-base font-bold leading-snug text-warning">
                          יש לך בערך{" "}
                          {formatMoney(
                            currentStage.lossAversion.annualLossAmount,
                            currentStage.lossAversion.currency,
                          )}{" "}
                          בשנה שלא עובדים בשבילך
                        </p>
                        <Coins className="h-5 w-5 shrink-0 text-warning" />
                      </div>

                      <p className="text-xs leading-relaxed text-muted-foreground">
                        לפי ההכנסות וההוצאות שלך, כ־
                        <span className="font-semibold text-foreground">
                          {formatMoney(
                            monthlyLoss,
                            currentStage.lossAversion.currency,
                          )}
                        </span>{" "}
                        בכל חודש נשארים פנויים אך לא נחסכים ולא מושקעים — הם
                        פשוט יושבים בעו"ש. במהלך שנה זה מצטבר ל־
                        <span className="font-semibold text-foreground">
                          {formatMoney(
                            currentStage.lossAversion.annualLossAmount,
                            currentStage.lossAversion.currency,
                          )}
                        </span>
                        .
                      </p>

                      {currentStage.lossAversion.lossPercentage > 0 && (
                        <p className="mt-2 text-xs font-medium text-warning/90">
                          זה כ־
                          {new Intl.NumberFormat("he-IL", {
                            maximumFractionDigits: 1,
                          }).format(currentStage.lossAversion.lossPercentage)}
                          % מההכנסה השנתית שלך שנשארת לא מנוצלת.
                        </p>
                      )}

                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        זה לא קנס ולא כסף שהפסדת — זה כסף שאתה יכול להפנות
                        למטרות שלך. מעבר לשלב הבא יעזור לך להפוך את העודף
                        הזה לחיסכון והשקעה שצומחים עם הזמן.
                      </p>
                    </div>
                  )}

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
                    {/* Manual data-loading controls are hidden in Demo Mode. */}
                    {!demoMode && (
                      <>
                        <p className="text-xs text-muted-foreground">
                          העלה נתונים מעודכנים — ה-LLM יריץ ניתוח מחדש וישמר את
                          ההתקדמות הקיימת שלך.
                        </p>
                        <DataLoadSection onSuccess={handleRefreshSuccess} />
                      </>
                    )}

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
