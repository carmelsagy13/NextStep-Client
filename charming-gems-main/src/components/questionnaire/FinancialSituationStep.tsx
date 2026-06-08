import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import type { FinancialSituation } from '@/types/userProfile';
import { ArrowRight, Wallet, PiggyBank, CreditCard } from 'lucide-react';

interface FinancialSituationStepProps {
  initialData?: Partial<FinancialSituation>;
  onNext: (data: FinancialSituation) => void;
}

const incomeRanges = [
  { value: 'under-5k', label: 'Under ₪5,000' },
  { value: '5k-10k', label: '₪5,000 - ₪10,000' },
  { value: '10k-20k', label: '₪10,000 - ₪20,000' },
  { value: '20k-35k', label: '₪20,000 - ₪35,000' },
  { value: 'over-35k', label: 'Over ₪35,000' },
];

const savingsRanges = [
  { value: 'none', label: 'No savings yet' },
  { value: 'under-10k', label: 'Under ₪10,000' },
  { value: '10k-50k', label: '₪10,000 - ₪50,000' },
  { value: '50k-100k', label: '₪50,000 - ₪100,000' },
  { value: 'over-100k', label: 'Over ₪100,000' },
];

export function FinancialSituationStep({ initialData, onNext }: FinancialSituationStepProps) {
  const [monthlyIncome, setMonthlyIncome] = useState(initialData?.monthlyIncome || '');
  const [currentSavings, setCurrentSavings] = useState(initialData?.currentSavings || '');
  const [hasEmergencyFund, setHasEmergencyFund] = useState(initialData?.hasEmergencyFund || false);
  const [hasDebts, setHasDebts] = useState(initialData?.hasDebts || false);

  const canProceed = monthlyIncome && currentSavings;

  const handleSubmit = () => {
    if (!canProceed) return;
    
    onNext({
      monthlyIncome,
      monthlyExpenses: '', // Will be calculated or asked later
      currentSavings,
      hasEmergencyFund,
      hasDebts,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold">Your Financial Situation</h2>
        <p className="text-muted-foreground">
          Help us understand where you're starting from
        </p>
      </div>

      {/* Monthly Income */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          Monthly Income (after tax)
        </Label>
        <RadioGroup value={monthlyIncome} onValueChange={setMonthlyIncome} className="grid gap-2">
          {incomeRanges.map((range) => (
            <label
              key={range.value}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                monthlyIncome === range.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={range.value} />
              <span>{range.label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Current Savings */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-primary" />
          Total Savings
        </Label>
        <RadioGroup value={currentSavings} onValueChange={setCurrentSavings} className="grid gap-2">
          {savingsRanges.map((range) => (
            <label
              key={range.value}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                currentSavings === range.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={range.value} />
              <span>{range.label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Additional Questions */}
      <div className="space-y-4 p-4 rounded-xl bg-muted/50">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="emergency-fund"
            checked={hasEmergencyFund}
            onCheckedChange={(checked) => setHasEmergencyFund(checked as boolean)}
          />
          <div className="space-y-1">
            <Label htmlFor="emergency-fund" className="font-medium cursor-pointer">
              I have an emergency fund (3+ months expenses)
            </Label>
            <p className="text-sm text-muted-foreground">
              Money set aside specifically for unexpected expenses
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="has-debts"
            checked={hasDebts}
            onCheckedChange={(checked) => setHasDebts(checked as boolean)}
          />
          <div className="space-y-1">
            <Label htmlFor="has-debts" className="font-medium cursor-pointer flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              I have outstanding debts
            </Label>
            <p className="text-sm text-muted-foreground">
              Credit cards, loans, or other liabilities
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!canProceed}
        className="w-full h-12 text-base"
        size="lg"
      >
        Continue
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
