import { Check } from 'lucide-react';

interface QuestionnaireProgressProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { id: 1, label: 'Financial Situation' },
  { id: 2, label: 'Your Goals' },
  { id: 3, label: 'Knowledge Level' },
];

export function QuestionnaireProgress({ currentStep }: QuestionnaireProgressProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center relative">
        {/* Progress line */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -translate-y-1/2 z-0" />
        <div 
          className="absolute left-0 top-1/2 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                step.id < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : step.id === currentStep
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.id < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="font-semibold">{step.id}</span>
              )}
            </div>
            <span
              className={`mt-2 text-xs font-medium hidden sm:block ${
                step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
