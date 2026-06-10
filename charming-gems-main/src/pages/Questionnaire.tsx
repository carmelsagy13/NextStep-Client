import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionnaireProgress } from '@/components/questionnaire/QuestionnaireProgress';
import { FinancialSituationStep } from '@/components/questionnaire/FinancialSituationStep';
import { FinancialGoalsStep } from '@/components/questionnaire/FinancialGoalsStep';
import { KnowledgeLevelStep } from '@/components/questionnaire/KnowledgeLevelStep';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { FinancialSituation, FinancialGoals, KnowledgeLevel, UserProfile } from '@/types/userProfile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

type Step = 1 | 2 | 3 | 4;

const Questionnaire = () => {
  const navigate = useNavigate();
  const { saveProfile, hasCompletedQuestionnaire, profile } = useUserProfile();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  
  const [financialSituation, setFinancialSituation] = useState<FinancialSituation | null>(null);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoals | null>(null);
  const [knowledgeLevel, setKnowledgeLevel] = useState<KnowledgeLevel | null>(null);

  // Pre-fill from existing profile if available
  useEffect(() => {
    if (profile) {
      if (profile.financialSituation) setFinancialSituation(profile.financialSituation);
      if (profile.financialGoals) setFinancialGoals(profile.financialGoals);
      if (profile.knowledgeLevel) setKnowledgeLevel(profile.knowledgeLevel);
    }
  }, [profile]);

  const handleFinancialSituationComplete = (data: FinancialSituation) => {
    setFinancialSituation(data);
    setCurrentStep(2);
  };

  const handleGoalsComplete = (data: FinancialGoals) => {
    setFinancialGoals(data);
    setCurrentStep(3);
  };

  const handleKnowledgeComplete = (data: KnowledgeLevel) => {
    setKnowledgeLevel(data);
    
    // Save complete profile
    const completeProfile: UserProfile = {
      financialSituation: financialSituation!,
      financialGoals: financialGoals!,
      knowledgeLevel: data,
    };
    
    saveProfile(completeProfile);
    setCurrentStep(4);
  };

  const goBack = () => {
    setCurrentStep((prev) => (prev > 1 ? (prev - 1) as Step : prev));
  };

  // Completion screen
  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold">You're All Set! 🎉</h1>
            <p className="text-muted-foreground">
              We've created a personalized financial roadmap just for you.
            </p>
          </div>

          <div className="glass-card p-6 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-medium">Your personalized plan includes:</span>
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
                <span className="text-primary-foreground font-bold text-lg">N</span>
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
            <KnowledgeLevelStep
              initialData={knowledgeLevel || undefined}
              onComplete={handleKnowledgeComplete}
              onBack={goBack}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Questionnaire;
