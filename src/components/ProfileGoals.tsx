import { useEffect, useMemo, useState } from "react";
import { Target, Pencil, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getQuestionnaire,
  getQuestionnaireResponses,
  submitQuestionnaireResponses,
} from "@/api/questionnaire.api";
import { DEFAULT_LANG, localize } from "@/lib/questionnaireEngine";
import { formatThousands, parseThousands } from "@/lib/utils";
import type {
  AnswerValue,
  Question,
  Questionnaire,
} from "@/types/questionnaire";

const LANG = DEFAULT_LANG;

// The questionnaire-response fields that represent the user's goals. Each goal
// has an amount (NUMBER) and a timeframe (SINGLE_CHOICE) question.
const GOALS: {
  id: string;
  label: string;
  amountKey: string;
  timeframeKey: string;
}[] = [
  {
    id: "trip",
    label: "טיול",
    amountKey: "q_goal_trip_amount",
    timeframeKey: "q_goal_trip_timeframe",
  },
  {
    id: "home",
    label: "דירה",
    amountKey: "q_goal_home_amount",
    timeframeKey: "q_goal_home_timeframe",
  },
  {
    id: "car",
    label: "רכב",
    amountKey: "q_goal_car_amount",
    timeframeKey: "q_goal_car_timeframe",
  },
  {
    id: "wedding",
    label: "חתונה",
    amountKey: "q_goal_wedding_amount",
    timeframeKey: "q_goal_wedding_timeframe",
  },
];

const GOAL_KEYS = new Set(GOALS.flatMap((g) => [g.amountKey, g.timeframeKey]));

/** Recursively flatten the questionnaire tree into a map keyed by questionKey. */
function flattenQuestions(
  questionnaire: Questionnaire | null,
): Map<string, Question> {
  const map = new Map<string, Question>();
  if (!questionnaire) return map;
  const walk = (questions: Question[]) => {
    for (const q of questions) {
      map.set(q.questionKey, q);
      if (q.children?.length) walk(q.children);
    }
  };
  for (const screen of questionnaire.screens ?? []) {
    walk(screen.questions ?? []);
  }
  return map;
}

/**
 * Profile-page section that shows the user's goal answers from the
 * questionnaire (trip / home / car / wedding — amount + timeframe) and lets
 * them edit those answers. Saving re-submits the answers so the server
 * persists them and bumps `updated_at`.
 */
export default function ProfileGoals() {
  const [questions, setQuestions] = useState<Map<string, Question>>(new Map());
  const [values, setValues] = useState<Record<string, AnswerValue>>({});
  const [draft, setDraft] = useState<Record<string, AnswerValue>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [structure, responses] = await Promise.all([
          getQuestionnaire(),
          getQuestionnaireResponses(),
        ]);
        if (cancelled) return;

        setQuestions(flattenQuestions(structure));

        const map: Record<string, AnswerValue> = {};
        for (const item of responses.responses ?? []) {
          if (GOAL_KEYS.has(item.questionKey)) {
            map[item.questionKey] = item.value as AnswerValue;
          }
        }
        setValues(map);
      } catch {
        if (!cancelled) setError("שגיאה בטעינת היעדים");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Only show goals the user actually answered.
  const answeredGoals = useMemo(
    () =>
      GOALS.filter(
        (g) =>
          values[g.amountKey] !== undefined ||
          values[g.timeframeKey] !== undefined,
      ),
    [values],
  );

  const startEdit = () => {
    setDraft({ ...values });
    setError("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError("");
  };

  const setDraftValue = (key: string, value: AnswerValue) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setError("");
    setIsSaving(true);
    try {
      const payload = Object.entries(draft)
        .filter(([key]) => GOAL_KEYS.has(key))
        .filter(([, value]) => value !== undefined && value !== "")
        .map(([questionKey, value]) => ({ questionKey, value }));

      await submitQuestionnaireResponses(payload);
      setValues({ ...draft });
      setIsEditing(false);
    } catch {
      setError("שגיאה בשמירה — נסה שוב");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">היעדים שלי</h3>
        </div>
        {!isLoading && answeredGoals.length > 0 && !isEditing && (
          <button
            type="button"
            onClick={startEdit}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted active:scale-95"
          >
            <Pencil className="h-3 w-3" />
            עריכה
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : answeredGoals.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          עדיין לא הגדרת יעדים. מלא/י את השאלון כדי להגדיר יעדים.
        </p>
      ) : (
        <div className="space-y-3">
          {answeredGoals.map((goal) => {
            const amountQ = questions.get(goal.amountKey);
            const timeframeQ = questions.get(goal.timeframeKey);
            const amountLabel = amountQ
              ? localize(amountQ.text, LANG)
              : "סכום יעד (₪)";
            const timeframeText = timeframeQ
              ? localize(timeframeQ.text, LANG)
              : "טווח זמן";

            return (
              <div
                key={goal.id}
                className="rounded-lg border border-border/60 px-3 py-3"
              >
                <p className="text-sm font-semibold text-foreground mb-2">
                  {goal.label}
                </p>

                {isEditing ? (
                  <div className="space-y-3">
                    {/* Amount */}
                    <div className="space-y-1">
                      <Label
                        htmlFor={`${goal.id}-amount`}
                        className="text-xs text-muted-foreground"
                      >
                        {amountLabel}
                      </Label>
                      <Input
                        id={`${goal.id}-amount`}
                        type="text"
                        inputMode="numeric"
                        dir="ltr"
                        className="text-end"
                        value={
                          draft[goal.amountKey] === undefined ||
                          draft[goal.amountKey] === null
                            ? ""
                            : formatThousands(
                                draft[goal.amountKey] as number | string,
                              )
                        }
                        onChange={(e) => {
                          const raw = parseThousands(e.target.value);
                          setDraftValue(
                            goal.amountKey,
                            raw === "" ? undefined : Number(raw),
                          );
                        }}
                      />
                    </div>

                    {/* Timeframe (months as a plain number) */}
                    <div className="space-y-1">
                      <Label
                        htmlFor={`${goal.id}-timeframe`}
                        className="text-xs text-muted-foreground"
                      >
                        {timeframeText}
                      </Label>
                      <Input
                        id={`${goal.id}-timeframe`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        dir="ltr"
                        className="text-end"
                        value={
                          draft[goal.timeframeKey] === undefined ||
                          draft[goal.timeframeKey] === null
                            ? ""
                            : String(draft[goal.timeframeKey])
                        }
                        onChange={(e) =>
                          setDraftValue(
                            goal.timeframeKey,
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-sm">
                    {values[goal.amountKey] !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {amountLabel}
                        </span>
                        <span className="font-medium">
                          ₪
                          {Number(values[goal.amountKey]).toLocaleString(
                            "he-IL",
                          )}
                        </span>
                      </div>
                    )}
                    {values[goal.timeframeKey] !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {timeframeText}
                        </span>
                        <span className="font-medium">
                          {Number(values[goal.timeframeKey])} חודשים
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {error && <p className="text-xs text-destructive">{error}</p>}

          {isEditing && (
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                שמור
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelEdit}
                disabled={isSaving}
                className="flex items-center gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                ביטול
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
