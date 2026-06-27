// Pure, framework-agnostic questionnaire engine.
// Handles localization, dependency evaluation, visibility resolution,
// state sanitization, payload compilation, and client-side validation.

import type {
  AnswerPayloadItem,
  AnswerState,
  AnswerValue,
  Dependency,
  Lang,
  LocalizedString,
  Question,
  Screen,
} from "@/types/questionnaire";

export const DEFAULT_LANG: Lang = "he";

/** Resolve a localized `{ he, en }` object into a display string. */
export function localize(
  value: LocalizedString,
  lang: Lang = DEFAULT_LANG,
): string {
  if (!value) return "";
  return value[lang] ?? value.he ?? value.en ?? "";
}

/** Sort any tree level by `orderIndex` (missing index sorts last-stable as 0). */
export function byOrderIndex<T extends { orderIndex?: number }>(
  a: T,
  b: T,
): number {
  return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
}

// Keys/labels that signal a NUMBER question holds a monetary amount.
const MONEY_KEY_PATTERN =
  /(amount|income|expense|salary|saving|debt|loan|rent|tuition|budget|price|cost|payment|balance|worth|fund|sum)/i;

/**
 * Heuristic: does this NUMBER question represent money? True when its
 * questionKey matches a money-related keyword, or its label contains a
 * shekel sign / "שקל". Used to apply thousands-separator formatting.
 */
export function isMoneyQuestion(
  question: Question,
  lang: Lang = DEFAULT_LANG,
): boolean {
  if (question.type !== "NUMBER") return false;
  if (MONEY_KEY_PATTERN.test(question.questionKey)) return true;
  const text = localize(question.text, lang);
  return text.includes("₪") || /שקל|ש"ח|ש״ח/.test(text);
}

function isEmptyValue(value: AnswerValue): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

/** Strict `YYYY-MM-DD` matcher. */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Format a `Date` into a `YYYY-MM-DD` string using its LOCAL calendar date.
 * Avoids the UTC shift that `Date.prototype.toISOString()` introduces.
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a `YYYY-MM-DD` string into a local `Date`, returning null if the
 * format is wrong or the date is impossible (e.g. `2026-02-30`).
 */
export function parseDateISO(value: string | undefined | null): Date | null {
  if (!value || !ISO_DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  // Reject values that JS rolled over (e.g. Feb 30 -> Mar 2).
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Evaluate a single dependency rule against the current answer state. */
function evaluateRule(rule: Dependency, state: AnswerState): boolean {
  const actual = state[rule.triggerQuestionKey];

  switch (rule.operator) {
    case "EQUALS":
      return actual === rule.value;
    case "NOT_EQUALS":
      return actual !== rule.value;
    case "INCLUDES":
      return Array.isArray(actual) && actual.includes(rule.value as string);
    case "GT":
      return Number(actual) > Number(rule.value);
    case "LT":
      return Number(actual) < Number(rule.value);
    case "EXISTS":
      return actual !== undefined && actual !== null && actual !== "";
    default:
      return true;
  }
}

/**
 * Evaluate a question's dependency array.
 * - Rules with the SAME `group` are AND-ed.
 * - Rules with DIFFERENT `group` values are OR-ed.
 * - No dependencies => always visible.
 */
export function evaluateDependencies(
  dependencies: Dependency[] | undefined,
  state: AnswerState,
): boolean {
  if (!dependencies || dependencies.length === 0) return true;

  const groups = new Map<number, Dependency[]>();
  for (const rule of dependencies) {
    const bucket = groups.get(rule.group) ?? [];
    bucket.push(rule);
    groups.set(rule.group, bucket);
  }

  // OR across groups; a single fully-satisfied (AND) group makes it visible.
  for (const groupRules of groups.values()) {
    if (groupRules.every((rule) => evaluateRule(rule, state))) return true;
  }
  return false;
}

/**
 * Walk the full tree and collect the keys of every currently visible question.
 * A question is visible iff its parent is visible AND its own dependencies pass.
 */
export function computeVisibleKeys(
  screens: Screen[],
  state: AnswerState,
): Set<string> {
  const visible = new Set<string>();

  const walk = (questions: Question[], parentVisible: boolean) => {
    for (const question of questions) {
      const selfVisible =
        parentVisible && evaluateDependencies(question.dependencies, state);
      if (selfVisible) visible.add(question.questionKey);
      walk(question.children ?? [], selfVisible);
    }
  };

  for (const screen of screens) walk(screen.questions, true);
  return visible;
}

/**
 * Remove answers for any question that is not currently visible.
 * Runs to a fixed point because hiding one field can flip the visibility
 * of another field that depends on it.
 */
export function sanitizeState(
  screens: Screen[],
  state: AnswerState,
): AnswerState {
  let current: AnswerState = { ...state };

  for (let pass = 0; pass < 50; pass++) {
    const visible = computeVisibleKeys(screens, current);
    const next: AnswerState = {};
    let changed = false;

    for (const key of Object.keys(current)) {
      if (visible.has(key)) next[key] = current[key];
      else changed = true;
    }

    current = next;
    if (!changed) break;
  }

  return current;
}

/** Compile visible answers into the flat POST payload array. */
export function compilePayload(
  screens: Screen[],
  state: AnswerState,
): AnswerPayloadItem[] {
  const visible = computeVisibleKeys(screens, state);
  return Object.entries(state)
    .filter(([key, value]) => visible.has(key) && !isEmptyValue(value))
    .map(([questionKey, value]) => ({ questionKey, value }));
}

/** Validate a single answer. Returns a Hebrew error message or null. */
export function validateQuestion(
  question: Question,
  value: AnswerValue,
): string | null {
  if (isEmptyValue(value)) {
    return question.isRequired ? "שדה חובה" : null;
  }

  // DATE and DURATION carry intrinsic validation regardless of `validation` rules.
  if (question.type === "DATE") {
    if (typeof value !== "string" || !parseDateISO(value)) {
      return "יש לבחור תאריך תקין";
    }
  }

  if (question.type === "DURATION") {
    const months = Number(value);
    if (!Number.isInteger(months) || months < 0) {
      return "יש להזין מספר חודשים תקין";
    }
    const durationRules = question.validation;
    if (durationRules?.min !== undefined && months < durationRules.min)
      return `הערך המינימלי הוא ${durationRules.min} חודשים`;
    if (durationRules?.max !== undefined && months > durationRules.max)
      return `הערך המקסימלי הוא ${durationRules.max} חודשים`;
  }

  const rules = question.validation;
  if (!rules) return null;

  if (question.type === "NUMBER") {
    const num = Number(value);
    if (Number.isNaN(num)) return "יש להזין מספר תקין";
    if (rules.min !== undefined && num < rules.min)
      return `הערך המינימלי הוא ${rules.min}`;
    if (rules.max !== undefined && num > rules.max)
      return `הערך המקסימלי הוא ${rules.max}`;
  }

  if (question.type === "TEXT") {
    const str = String(value);
    if (rules.minLength !== undefined && str.length < rules.minLength)
      return `יש להזין לפחות ${rules.minLength} תווים`;
    if (rules.maxLength !== undefined && str.length > rules.maxLength)
      return `ניתן להזין עד ${rules.maxLength} תווים`;
    if (rules.pattern && !new RegExp(rules.pattern).test(str))
      return "הפורמט שהוזן אינו תקין";
  }

  return null;
}

/** Validate every visible question within a screen. Returns a key->message map. */
export function validateScreen(
  screen: Screen,
  state: AnswerState,
  visibleKeys: Set<string>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const walk = (questions: Question[]) => {
    for (const question of questions) {
      if (!visibleKeys.has(question.questionKey)) continue;
      const message = validateQuestion(question, state[question.questionKey]);
      if (message) errors[question.questionKey] = message;
      walk(question.children ?? []);
    }
  };

  walk(screen.questions);
  return errors;
}
