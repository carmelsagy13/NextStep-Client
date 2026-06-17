// Server-driven questionnaire tree types.
// The entire flow (screens, questions, options, visibility) is described by the API.

export type Lang = "he" | "en";

export type LocalizedString = { he?: string; en?: string } | null;

export type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "TEXT"
  | "NUMBER";

export type DependencyOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "INCLUDES"
  | "GT"
  | "LT"
  | "EXISTS";

export interface Dependency {
  triggerQuestionKey: string;
  operator: DependencyOperator;
  value?: unknown;
  /** Rules sharing a group are AND-ed; different groups are OR-ed. */
  group: number;
}

export interface QuestionOption {
  value: string;
  label: LocalizedString;
  orderIndex: number;
}

export interface Validation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface Question {
  questionKey: string;
  type: QuestionType;
  isRequired: boolean;
  orderIndex?: number;
  text: LocalizedString;
  validation?: Validation | null;
  options: QuestionOption[];
  dependencies: Dependency[];
  children: Question[];
}

export interface Screen {
  screenKey: string;
  orderIndex: number;
  title: LocalizedString;
  subtitle: LocalizedString;
  questions: Question[];
}

export interface Questionnaire {
  screens: Screen[];
}

/** A single answer value can be a string, number, or string[] (multi-choice). */
export type AnswerValue = string | number | string[] | undefined;

export type AnswerState = Record<string, AnswerValue>;

export interface AnswerPayloadItem {
  questionKey: string;
  value: unknown;
}

export interface QuestionnaireRespondPayload {
  answers: AnswerPayloadItem[];
}

export interface FieldValidationError {
  questionKey: string;
  message: string;
}

export interface QuestionnaireValidationResponse {
  message: string;
  errors: FieldValidationError[];
}
