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
