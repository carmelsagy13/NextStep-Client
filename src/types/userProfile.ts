// User profile types for the questionnaire

export interface FinancialSituation {
  monthlyIncome: string;
  monthlyExpenses: string;
  currentSavings: string;
  hasEmergencyFund: boolean;
  hasDebts: boolean;
  debtAmount?: string;
}

export interface FinancialGoals {
  primaryGoal: string;
  timeHorizon: string;
  savingsTarget?: string;
  priorities: string[];
}

export interface KnowledgeLevel {
  investmentExperience: string;
  riskTolerance: string;
  financialLiteracy: string;
  topicsOfInterest: string[];
}

export interface UserProfile {
  financialSituation: FinancialSituation;
  financialGoals: FinancialGoals;
  knowledgeLevel: KnowledgeLevel;
  completedAt?: string;
}

export type QuestionnaireStep = 'financial-situation' | 'financial-goals' | 'knowledge-level' | 'complete';
