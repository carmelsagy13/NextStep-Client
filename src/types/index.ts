// Auth
export interface AuthResponse {
  accessToken: string;
  userId: string;
}

// Financial Snapshot
export interface FinancialSnapshot {
  snapshotId: string;
  userId: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  totalDebt: number;
  createdAt: string;
}

// Financial Event
export interface FinancialEvent {
  eventId: string;
  userId: string;
  eventType: string;
  amount: number;
  eventDate: string;
}

// Goal
export const UserGoalStatus = {
  ACTIVE: "active",
  COMPLETED: "completed",
  REMOVED: "removed",
  ABANDONED: "abandoned",
  EXPIRED: "expired",
} as const;

export type UserGoalStatus =
  (typeof UserGoalStatus)[keyof typeof UserGoalStatus];

export interface UserGoal {
  goalId: string;
  userId: string;
  goalName: string;
  targetAmount: number | null;
  currentAmount: number | string;
  targetDate: string | null;
  status: UserGoalStatus;
  priority: number;
  assignedAt: string | null;
  completedAt: string | null;
  removedAt: string | null;
  removalReason: string | null;
  roadmapGoalId: string | null;
  dynamicParams: Record<string, unknown>;
  aiInsight: string | null;
  sourceProfileHistoryId: string | null;
  roadmapGoal?: RoadmapGoal;
}

// Roadmap Goal (template)
export interface RoadmapGoal {
  goalId: string;
  stepId: number;
  type: string;
  title: string;
  descriptionTemplate: string;
  dynamicParams: Record<string, unknown>;
  requiredContext: string | null;
  isActive: boolean;
  priority: number;
}

// Roadmap
export interface RoadmapStep {
  stepId: number;
  title: string;
  description: string;
  criteria: Record<string, unknown>;
}

export interface RoadmapState {
  stateId: string;
  userId: string;
  progressPercent: number;
  stateDescription: string;
  // Resilient aliases for the backend `progress_percents` column, which may
  // be serialised in snake_case or with a plural name.
  progressPercents?: number;
  progress_percent?: number;
  progress_percents?: number;
}

export interface RoadmapResponse {
  state: RoadmapState | null;
  steps: RoadmapStep[];
  /**
   * Resolved current-step object derived from the authoritative profile step.
   * Visualization only — never use this to drive business logic; read the
   * user's step from GET /profile → `currentStep` instead.
   */
  currentStep?: RoadmapStep;
}

/**
 * Authoritative user profile (GET /profile). `currentStep` is the single
 * source of truth for the user's financial step across the app.
 */
export interface Profile {
  currentStep: number;
  riskTolerance?: string;
  knowledgeLevel?: string;
  occupation?: string;
  [key: string]: unknown;
}

// Upload analysis — response from POST /openfinance/upload
export interface UploadAnalysisResponse {
  roadmap_state: RoadmapState;
  user_goals: UserGoal[];
}

// POST /openfinance/connect-api — two-stage response
export interface ConnectApiConnectionRequired {
  stage: "CONNECTION_REQUIRED";
  connectionUrl: string;
  connectionId: string;
}

export interface ConnectApiAnalysisComplete {
  stage: "ANALYSIS_COMPLETE";
  analysis: UploadAnalysisResponse;
}

export type ConnectApiResponse =
  | ConnectApiConnectionRequired
  | ConnectApiAnalysisComplete;

// User Profile History
export interface UserProfileHistory {
  historyId: string;
  userId: string;
  step: number;
  progressPercent: number;
  cashFlow: number;
  creditConsumption: number;
  loans: number;
  savingsInvestments: number;
  pensionLongTerm: number;
  lifestyleClubs: number;
  mortgage: number;
  systemIndicators: number;
  previousStep: number | null;
  stepChanged: boolean;
  progressDelta: number | null;
  stateDescription: string;
  llmReasoning: string;
  createdAt: string;
}

// Notification
export interface UserNotification {
  notificationId: string;
  userId: string;
  templateId: string;
  isRead: boolean;
  sentAt: string;
  template: {
    templateId: string;
    title: string;
    body: string;
    triggerType: string;
  };
}
