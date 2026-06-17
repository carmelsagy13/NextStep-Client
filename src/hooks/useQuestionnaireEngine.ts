// Custom hook owning the unified questionnaire state, visibility engine,
// per-field errors, payload compilation, and sanitization.

import { useCallback, useMemo, useState } from "react";
import type {
  AnswerPayloadItem,
  AnswerState,
  AnswerValue,
  FieldValidationError,
  Screen,
} from "@/types/questionnaire";
import {
  compilePayload,
  computeVisibleKeys,
  sanitizeState,
  validateScreen as validateScreenRules,
} from "@/lib/questionnaireEngine";

export interface QuestionnaireEngine {
  answers: AnswerState;
  errors: Record<string, string>;
  /** True if the question is currently visible given the answer state. */
  isVisible: (questionKey: string) => boolean;
  getAnswer: (questionKey: string) => AnswerValue;
  getError: (questionKey: string) => string | undefined;
  /** Set an answer; auto-sanitizes any now-hidden fields out of state. */
  setAnswer: (questionKey: string, value: AnswerValue) => void;
  /** Validate a single screen's visible fields. Returns true if valid. */
  validateScreen: (screen: Screen) => boolean;
  /** Map server-side field errors back onto the layout. */
  setServerErrors: (errors: FieldValidationError[]) => void;
  clearErrors: () => void;
  /** Flat payload of visible answers for POST /questionnaire/respond. */
  compile: () => AnswerPayloadItem[];
}

function isEmpty(value: AnswerValue): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

export function useQuestionnaireEngine(screens: Screen[]): QuestionnaireEngine {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const visibleKeys = useMemo(
    () => computeVisibleKeys(screens, answers),
    [screens, answers],
  );

  const isVisible = useCallback(
    (questionKey: string) => visibleKeys.has(questionKey),
    [visibleKeys],
  );

  const getAnswer = useCallback(
    (questionKey: string) => answers[questionKey],
    [answers],
  );

  const getError = useCallback(
    (questionKey: string) => errors[questionKey],
    [errors],
  );

  const setAnswer = useCallback(
    (questionKey: string, value: AnswerValue) => {
      setAnswers((prev) => {
        const draft: AnswerState = { ...prev };
        if (isEmpty(value)) {
          delete draft[questionKey];
        } else {
          draft[questionKey] = value;
        }
        // Re-evaluate the whole tree and strip any now-hidden answers.
        return sanitizeState(screens, draft);
      });
      // Clear this field's error as the user edits it.
      setErrors((prev) => {
        if (!(questionKey in prev)) return prev;
        const next = { ...prev };
        delete next[questionKey];
        return next;
      });
    },
    [screens],
  );

  const validateScreen = useCallback(
    (screen: Screen) => {
      const screenErrors = validateScreenRules(screen, answers, visibleKeys);
      setErrors((prev) => ({ ...prev, ...screenErrors }));
      return Object.keys(screenErrors).length === 0;
    },
    [answers, visibleKeys],
  );

  const setServerErrors = useCallback((serverErrors: FieldValidationError[]) => {
    const mapped: Record<string, string> = {};
    for (const error of serverErrors) {
      mapped[error.questionKey] = error.message;
    }
    setErrors((prev) => ({ ...prev, ...mapped }));
  }, []);

  const clearErrors = useCallback(() => setErrors({}), []);

  const compile = useCallback(
    () => compilePayload(screens, answers),
    [screens, answers],
  );

  return {
    answers,
    errors,
    isVisible,
    getAnswer,
    getError,
    setAnswer,
    validateScreen,
    setServerErrors,
    clearErrors,
    compile,
  };
}
