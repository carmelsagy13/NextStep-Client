import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
// Note: in RTL, "back" reads to the right and "forward" reads to the left.

import { useAuth } from "@/hooks/useAuth";
import {
  getQuestionnaire,
  submitQuestionnaireResponses,
} from "@/api/questionnaire.api";
import { useQuestionnaireEngine } from "@/hooks/useQuestionnaireEngine";
import { DynamicScreen } from "@/components/questionnaire/DynamicScreen";
import { byOrderIndex, DEFAULT_LANG } from "@/lib/questionnaireEngine";
import type {
  FieldValidationError,
  QuestionnaireValidationResponse,
} from "@/types/questionnaire";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const LANG = DEFAULT_LANG;

/** Extract field-level validation errors from an Axios error response. */
function extractFieldErrors(error: unknown): FieldValidationError[] {
  const data = (
    error as {
      response?: { data?: Partial<QuestionnaireValidationResponse> };
    }
  ).response?.data;
  return Array.isArray(data?.errors) ? data!.errors! : [];
}

const Questionnaire = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    data: questionnaire,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["questionnaire"],
    queryFn: getQuestionnaire,
    enabled: isAuthenticated,
  });

  // Ordered screens drive the entire flow — nothing is hardcoded.
  const screens = useMemo(
    () => [...(questionnaire?.screens ?? [])].sort(byOrderIndex),
    [questionnaire],
  );

  const engine = useQuestionnaireEngine(screens);

  const [screenIndex, setScreenIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!isAuthenticated) return null;

  // Loading the questionnaire structure
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Failed to load structure
  if (isError || screens.length === 0) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center p-4"
        dir="rtl"
      >
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            לא הצלחנו לטעון את השאלון. נסו שוב.
          </p>
          <Button onClick={() => refetch()}>נסה שוב</Button>
        </div>
      </div>
    );
  }

  // Completion screen
  if (isComplete) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center p-4"
        dir="rtl"
      >
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold">הכל מוכן! 🎉</h1>
            <p className="text-muted-foreground">
              בנינו עבורכם מסלול פיננסי מותאם אישית.
            </p>
          </div>
          <Link to="/roadmap">
            <Button size="lg" className="w-full h-12 text-base">
              למסלול שלי
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentScreen = screens[screenIndex];
  const isLastScreen = screenIndex === screens.length - 1;
  // Progress reflects screens the user has actually completed, not the
  // current (still-unfilled) screen. Reaches 100% only after final submit.
  const progress = isComplete
    ? 100
    : (screenIndex / screens.length) * 100;

  const goBack = () => {
    setSubmitError("");
    setScreenIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = async () => {
    setSubmitError("");

    // Validate visible fields on the current screen.
    if (!engine.validateScreen(currentScreen)) return;

    if (!isLastScreen) {
      setScreenIndex((prev) => prev + 1);
      return;
    }

    // Final submission — compile only the visible (sanitized) answers.
    setIsSubmitting(true);
    try {
      await submitQuestionnaireResponses(engine.compile());
      setIsComplete(true);
    } catch (error) {
      const fieldErrors = extractFieldErrors(error);
      if (fieldErrors.length > 0) {
        engine.setServerErrors(fieldErrors);
        // Jump back to the first screen that owns a failing field.
        const failingIndex = screens.findIndex((screen) =>
          fieldErrors.some((fieldError) =>
            JSON.stringify(screen).includes(`"${fieldError.questionKey}"`),
          ),
        );
        if (failingIndex >= 0) setScreenIndex(failingIndex);
        setSubmitError("יש לתקן את השדות המסומנים ולשלוח שוב.");
      } else {
        setSubmitError("השליחה נכשלה. נסו שוב.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/profile" className="flex items-center gap-2">
              <img
                src="/IconNoText.png"
                alt="NextStep"
                className="w-8 h-8"
              />
              <span className="font-display text-xl font-bold">NextStep</span>
            </Link>

            <Link to="/profile">
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
                יציאה
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          {/* Progress */}
          <div className="mb-8 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                שלב {screenIndex + 1} מתוך {screens.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {submitError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {submitError}
            </div>
          )}

          <div className="relative">
            {isSubmitting && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            <DynamicScreen
              key={currentScreen.screenKey}
              screen={currentScreen}
              engine={engine}
              lang={LANG}
            />
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center gap-3">
            {screenIndex > 0 && (
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-12"
                onClick={goBack}
                disabled={isSubmitting}
              >
                חזרה
              </Button>
            )}
            <Button
              size="lg"
              className="flex-1 h-12 text-base"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isLastScreen ? "סיום" : "המשך"}
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Questionnaire;
