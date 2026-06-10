import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import type { FinancialGoals } from '@/types/userProfile';
import { ArrowRight, ArrowLeft, Target, Clock } from 'lucide-react';

interface FinancialGoalsStepProps {
  initialData?: Partial<FinancialGoals>;
  onNext: (data: FinancialGoals) => void;
  onBack: () => void;
}

const goals = [
  { value: 'emergency-fund', label: 'Build an emergency fund', emoji: '🛡️' },
  { value: 'debt-free', label: 'Become debt-free', emoji: '💳' },
  { value: 'save-purchase', label: 'Save for a big purchase (car, home)', emoji: '🏠' },
  { value: 'retirement', label: 'Save for retirement', emoji: '🌴' },
  { value: 'invest', label: 'Start investing', emoji: '📈' },
  { value: 'passive-income', label: 'Build passive income', emoji: '💰' },
];

const timeHorizons = [
  { value: '6-months', label: '6 months or less' },
  { value: '1-year', label: 'Within 1 year' },
  { value: '1-3-years', label: '1-3 years' },
  { value: '3-5-years', label: '3-5 years' },
  { value: '5-plus-years', label: '5+ years' },
];

const priorities = [
  { value: 'security', label: 'Financial security' },
  { value: 'growth', label: 'Wealth growth' },
  { value: 'freedom', label: 'Financial freedom' },
  { value: 'family', label: 'Family\'s future' },
  { value: 'education', label: 'Learning & knowledge' },
];

export function FinancialGoalsStep({ initialData, onNext, onBack }: FinancialGoalsStepProps) {
  const [primaryGoal, setPrimaryGoal] = useState(initialData?.primaryGoal || '');
  const [timeHorizon, setTimeHorizon] = useState(initialData?.timeHorizon || '');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(initialData?.priorities || []);

  const canProceed = primaryGoal && timeHorizon;

  const togglePriority = (value: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  const handleSubmit = () => {
    if (!canProceed) return;
    
    onNext({
      primaryGoal,
      timeHorizon,
      priorities: selectedPriorities,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold">Your Financial Goals</h2>
        <p className="text-muted-foreground">
          What do you want to achieve?
        </p>
      </div>

      {/* Primary Goal */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Primary Goal
        </Label>
        <RadioGroup value={primaryGoal} onValueChange={setPrimaryGoal} className="grid gap-2">
          {goals.map((goal) => (
            <label
              key={goal.value}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                primaryGoal === goal.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={goal.value} />
              <span className="text-xl">{goal.emoji}</span>
              <span>{goal.label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Time Horizon */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          When do you want to achieve this?
        </Label>
        <RadioGroup value={timeHorizon} onValueChange={setTimeHorizon} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {timeHorizons.map((horizon) => (
            <label
              key={horizon.value}
              className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-center text-sm ${
                timeHorizon === horizon.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={horizon.value} className="sr-only" />
              <span>{horizon.label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Priorities */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          What matters most to you? (Optional)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {priorities.map((priority) => (
            <label
              key={priority.value}
              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedPriorities.includes(priority.value)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Checkbox
                checked={selectedPriorities.includes(priority.value)}
                onCheckedChange={() => togglePriority(priority.value)}
              />
              <span className="text-sm">{priority.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
          size="lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canProceed}
          className="flex-1 h-12"
          size="lg"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
