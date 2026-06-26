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
  titleHe: string | null;
  description: string;
  // 8 separate criteria columns (replacing the old single `criteria` object)
  criteriaEmergencyFund: number | null;
  criteriaDebtFree: number | null;
  criteriaInvestmentRate: number | null;
  criteriaPensionOptimized: number | null;
  criteriaRealEstateOwnership: number | null;
  criteriaPassiveIncome: number | null;
  criteriaNetWorth: number | null;
  criteriaFinancialIndependence: number | null;
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

// Aspirations (overarching financial goals) — dedicated store + REST endpoints.
// Replaces the old questionnaire-response goal keys (q_financial_goals, q_goal_*).

/** A dynamic attribute the user fills in for a given goal type. */
export interface GoalAttributeSpec {
  key: string; // e.g. "timeframeMonths"
  type: "number" | "string" | "boolean" | "date" | "string[]";
  required?: boolean;
  label?: { he: string; en?: string };
}

/** A selectable goal type from GET /aspirations/types (data-driven catalog). */
export interface GoalType {
  code: string; // e.g. "wedding_event" — STABLE id used when creating
  label: { he: string; en?: string };
  category: string | null; // e.g. "short_term"
  supportsAmount: boolean; // false → hide amount input
  supportsTimeframe: boolean; // false → hide date/timeframe input
  attributeSchema: GoalAttributeSpec[] | null; // dynamic fields to render & send in `attributes`
  defaultPriority: number; // sort ascending
  isActive: boolean;
}

export type AspirationStatus = "active" | "achieved" | "abandoned";

/** The current user's overarching goal from GET /aspirations. */
export interface Aspiration {
  aspirationId: string; // UUID — use for PATCH/DELETE
  goalTypeCode: string; // FK to GoalType.code
  title: string; // Hebrew display title (snapshot)
  targetAmount: string | null; // DECIMAL serialized as STRING — parse with Number()
  targetDate: string | null; // "YYYY-MM-DD" (or ISO) — may be null
  attributes: Record<string, unknown> | null; // e.g. { timeframeMonths: 13 }
  status: AspirationStatus;
  revision: number;
  lastSyncedRevision: number | null;
  createdAt: string;
  updatedAt: string;
}
