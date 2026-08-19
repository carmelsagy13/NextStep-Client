// Auth
export interface AuthResponse {
  accessToken: string;
  userId: string;
  /** Human-readable 9-character identifier (e.g. national ID). */
  id?: string;
  email?: string;
  /** When true, the client should run the automated Demo Mode flow. */
  demoMode?: boolean;
  /**
   * Present on the first Demo Mode login (no profile yet): the login call runs
   * the full pipeline synchronously and returns the result inline. Undefined on
   * subsequent logins, where a lightweight sync runs server-side in the
   * background.
   */
  demoResult?: DemoTriggerResponse;
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

export const RoadmapGoalType = {
  PERSONAL: "personal",
  MARKETING: "marketing",
  BONUS: "bonus",
  EDUCATIONAL: "educational",
} as const;

export type RoadmapGoalType =
  (typeof RoadmapGoalType)[keyof typeof RoadmapGoalType];

/**
 * Partner branding + commercial terms for a sponsored goal. Present only while
 * the backing offer is live — the server nulls it out and reports the goal as
 * `personal` once the campaign ends.
 */
export interface MarketingGoalMeta {
  offerCode: string;
  partnerName: string;
  partnerLogoUrl: string;
  bannerUrl: string | null;
  brandColor: string | null;
  headline: string;
  subheadline: string | null;
  benefitTags: string[];
  ctaLabel: string;
  ctaUrl: string;
  disclaimer: string;
}

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
  goalType?: RoadmapGoalType;
  marketing?: MarketingGoalMeta | null;
  roadmapGoal?: RoadmapGoal;
}

// Roadmap Goal (template)
export interface RoadmapGoal {
  goalId: string;
  stepId: number;
  type: RoadmapGoalType;
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
  /** Loss Aversion nudge for advancing to the next stage (may be null). */
  lossAversion?: LossAversion | null;
}

// Loss Aversion — quantifies what the user misses by not advancing to the
// next roadmap stage. Computed server-side during Open Finance analysis.
export interface LossComponent {
  key: string;
  label: string;
  monthlyAmount: number;
  annualAmount: number;
}

export interface LossAversion {
  nextStepId: number;
  nextStepTitle: string;
  nextStepTitleHe: string | null;
  monthlyLossAmount: number;
  annualLossAmount: number;
  lossPercentage: number;
  timeframeMonths: number;
  currency: string;
  components: LossComponent[];
  computedAt: string;
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
  /** Loss Aversion nudge (also nested inside `state`). */
  lossAversion?: LossAversion | null;
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

// POST /demo/trigger — automated Demo Mode generation.
// First call (no profile yet) runs the full Open Finance pipeline; subsequent
// calls run a lightweight aspiration sync only.
export interface DemoTriggerFull {
  mode: "full";
  full: UploadAnalysisResponse;
}

export interface DemoTriggerPartial {
  mode: "partial";
  partial: { updatedTasksCount: number };
}

export type DemoTriggerResponse = DemoTriggerFull | DemoTriggerPartial;

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
