import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import type { KnowledgeLevel } from '@/types/userProfile';
import { ArrowLeft, GraduationCap, TrendingUp, Shield } from 'lucide-react';

interface KnowledgeLevelStepProps {
  initialData?: Partial<KnowledgeLevel>;
  onComplete: (data: KnowledgeLevel) => void;
  onBack: () => void;
}

const experienceLevels = [
  { value: 'none', label: 'Complete beginner', description: 'I\'ve never invested before' },
  { value: 'basic', label: 'Some knowledge', description: 'I understand the basics' },
  { value: 'intermediate', label: 'Intermediate', description: 'I\'ve made some investments' },
  { value: 'advanced', label: 'Advanced', description: 'I actively manage investments' },
];

const riskToleranceLevels = [
  { value: 'conservative', label: 'Conservative', description: 'Prefer stability over growth', icon: Shield },
  { value: 'moderate', label: 'Moderate', description: 'Balance of growth and safety', icon: TrendingUp },
  { value: 'aggressive', label: 'Growth-focused', description: 'Higher risk for higher returns', icon: TrendingUp },
];

const topics = [
  { value: 'budgeting', label: 'Budgeting basics' },
  { value: 'saving', label: 'Saving strategies' },
  { value: 'investing', label: 'Investment fundamentals' },
  { value: 'stocks', label: 'Stock market' },
  { value: 'retirement', label: 'Retirement planning' },
  { value: 'tax', label: 'Tax optimization' },
  { value: 'real-estate', label: 'Real estate' },
  { value: 'crypto', label: 'Cryptocurrency' },
];

export function KnowledgeLevelStep({ initialData, onComplete, onBack }: KnowledgeLevelStepProps) {
  const [investmentExperience, setInvestmentExperience] = useState(initialData?.investmentExperience || '');
  const [riskTolerance, setRiskTolerance] = useState(initialData?.riskTolerance || '');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialData?.topicsOfInterest || []);

  const canProceed = investmentExperience && riskTolerance;

  const toggleTopic = (value: string) => {
    setSelectedTopics((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const handleSubmit = () => {
    if (!canProceed) return;
    
    onComplete({
      investmentExperience,
      riskTolerance,
      financialLiteracy: investmentExperience, // Derived from experience
      topicsOfInterest: selectedTopics,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold">Your Knowledge Level</h2>
        <p className="text-muted-foreground">
          Help us personalize your learning journey
        </p>
      </div>

      {/* Investment Experience */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-primary" />
          Investment Experience
        </Label>
        <RadioGroup value={investmentExperience} onValueChange={setInvestmentExperience} className="grid gap-2">
          {experienceLevels.map((level) => (
            <label
              key={level.value}
              className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                investmentExperience === level.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value={level.value} />
                <span className="font-medium">{level.label}</span>
              </div>
              <p className="text-sm text-muted-foreground ml-7">{level.description}</p>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Risk Tolerance */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Risk Tolerance
        </Label>
        <RadioGroup value={riskTolerance} onValueChange={setRiskTolerance} className="grid gap-2">
          {riskToleranceLevels.map((level) => {
            const Icon = level.icon;
            return (
              <label
                key={level.value}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  riskTolerance === level.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={level.value} />
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  level.value === 'conservative' ? 'bg-blue-100 text-blue-600' :
                  level.value === 'moderate' ? 'bg-amber-100 text-amber-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">{level.label}</p>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Topics of Interest */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          What would you like to learn? (Optional)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {topics.map((topic) => (
            <label
              key={topic.value}
              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                selectedTopics.includes(topic.value)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Checkbox
                checked={selectedTopics.includes(topic.value)}
                onCheckedChange={() => toggleTopic(topic.value)}
              />
              <span className="text-sm">{topic.label}</span>
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
          Complete Setup
        </Button>
      </div>
    </div>
  );
}
