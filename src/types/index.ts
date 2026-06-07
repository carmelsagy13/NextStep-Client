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
export interface UserGoal {
  goalId: string;
  userId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  isCompleted: boolean;
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
  currentStepId: number;
  progressPercent: number;
}

export interface RoadmapResponse {
  state: RoadmapState | null;
  steps: RoadmapStep[];
}

// Upload analysis — response from POST /openfinance/upload
export interface UploadAnalysisResponse {
  roadmap_state: RoadmapState;
  user_goals: UserGoal[];
}

// POST /openfinance/connect-api — two-stage response
export interface ConnectApiConnectionRequired {
  stage: 'CONNECTION_REQUIRED';
  connectionUrl: string;
  connectionId: string;
}

export interface ConnectApiAnalysisComplete {
  stage: 'ANALYSIS_COMPLETE';
  analysis: UploadAnalysisResponse;
}

export type ConnectApiResponse =
  | ConnectApiConnectionRequired
  | ConnectApiAnalysisComplete;

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
