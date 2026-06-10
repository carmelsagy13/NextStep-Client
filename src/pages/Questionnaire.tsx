import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionnaireProgress } from "@/components/questionnaire/QuestionnaireProgress";
import { FinancialSituationStep } from "@/components/questionnaire/FinancialSituationStep";
import { FinancialGoalsStep } from "@/components/questionnaire/FinancialGoalsStep";
import { KnowledgeLevelStep } from "@/components/questionnaire/KnowledgeLevelStep";
import { useAuth } from "@/hooks/useAuth";
import { submitQuestionnaire } from "@/api/questionnaire.api";
import type {
  FinancialSituation,
  FinancialGoals,
  KnowledgeLevel,
} from "@/types/userProfile";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

type Step = 1 | 2 | 3 | 4;

const Questionnaire = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [financialSituation, setFinancialSituation] =
    useState<FinancialSituation | null>(null);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoals | null>(
    null,
  );

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleFinancialSituationComplete = (data: FinancialSituation) => {
    setFinancialSituation(data);
    setCurrentStep(2);
  };

  const handleGoalsComplete = (data: FinancialGoals) => {
    setFinancialGoals(data);
    setCurrentStep(3);
  };

  const handleKnowledgeComplete = async (data: KnowledgeLevel) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await submitQuestionnaire({
        financialSituation,
        financialGoals,
        knowledgeLevel: data,
      });
      setCurrentStep(4);
    } catch (err) {
      const msg = (
        err as { response?: { data?: { message?: string | string[] } } }
      ).response?.data?.message;
      const errorText = Array.isArray(msg) ? msg[0] : msg;
      setSubmitError(errorText || "Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  };

  if (!isAuthenticated) return null;

  // Completion screen
  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold">
              You're All Set! 🎉
            </h1>
            <p className="text-muted-foreground">
              We've created a personalized financial roadmap just for you.
            </p>
          </div>

          <div className="glass-card p-6 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-medium">
                Your personalized plan includes:
              </span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Step-by-step action items based on your situation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Educational content matched to your knowledge level
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Goal tracking aligned with your timeline
              </li>
            </ul>
          </div>

          <Link to="/roadmap">
            <Button size="lg" className="w-full h-12 text-base">
              View My Roadmap
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  N
                </span>
              </div>
              <span className="font-display text-xl font-bold">NextStep</span>
            </Link>

            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          <QuestionnaireProgress currentStep={currentStep} totalSteps={3} />

          {submitError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {submitError}
            </div>
          )}

          {currentStep === 1 && (
            <FinancialSituationStep
              initialData={financialSituation || undefined}
              onNext={handleFinancialSituationComplete}
            />
          )}

          {currentStep === 2 && (
            <FinancialGoalsStep
              initialData={financialGoals || undefined}
              onNext={handleGoalsComplete}
              onBack={goBack}
            />
          )}

          {currentStep === 3 && (
            <div className="relative">
              {isSubmitting && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 rounded-xl">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              <KnowledgeLevelStep
                initialData={undefined}
                onComplete={handleKnowledgeComplete}
                onBack={goBack}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Questionnaire;
