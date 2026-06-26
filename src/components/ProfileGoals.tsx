import { useEffect, useMemo, useState } from "react";
import { Target, Pencil, Loader2, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAspirations,
  getAspirationTypes,
  createAspiration,
  updateAspiration,
  deleteAspiration,
  type CreateAspirationPayload,
  type UpdateAspirationPayload,
} from "@/api/aspirations.api";
import { getGoals } from "@/api/goals.api";
import { useRoadmapStore } from "@/store/roadmapStore";
import { formatThousands, parseThousands } from "@/lib/utils";
import type {
  Aspiration,
  GoalAttributeSpec,
  GoalType,
  UserGoal,
} from "@/types";

/** Pull a human-readable message out of an Axios-style error (e.g. 400s). */
function errorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data;
  const msg = data?.message;
  if (typeof msg === "string" && msg.trim()) return msg;
  if (Array.isArray(msg) && typeof msg[0] === "string") return msg[0];
  return fallback;
}

function labelText(label: { he: string; en?: string } | undefined): string {
  return label?.he ?? label?.en ?? "";
}

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("he-IL", { month: "short", year: "numeric" });
}

/**
 * Does this goal type capture its timeframe via an attribute (e.g.
 * `timeframeMonths`) rather than an explicit target date? If so we render the
 * attribute field and skip the separate date picker.
 */
function hasTimeframeAttr(type: GoalType | undefined): boolean {
  return !!type?.attributeSchema?.some(
    (a) => a.key === "timeframeMonths" || a.type === "date",
  );
}

/** Working state for the add/edit form. */
interface FormState {
  goalTypeCode: string;
  amount: string; // raw digit string for the amount input
  date: string; // YYYY-MM-DD
  attributes: Record<string, unknown>;
}

/**
 * Profile-page section that shows the user's overarching goals from the
 * Aspirations store (GET /aspirations) and lets them add, edit and remove
 * goals via the Aspirations endpoints. The goal-type picker and the inputs
 * shown for each type are driven entirely by GET /aspirations/types, so new
 * goal types appear automatically. After any mutation we re-fetch the user's
 * goals/tasks (GET /goals) because the server re-syncs the roadmap.
 */
export default function ProfileGoals() {
  const [goalTypes, setGoalTypes] = useState<GoalType[]>([]);
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state: null when not editing; otherwise either editing an existing
  // aspiration (editingId set) or creating a new one (editingId null).
  const [form, setForm] = useState<FormState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const setStoreGoals = useRoadmapStore((s) => s.setGoals);

  const typeByCode = useMemo(() => {
    const map = new Map<string, GoalType>();
    for (const t of goalTypes) map.set(t.code, t);
    return map;
  }, [goalTypes]);

  // Goal types the user hasn't created an active aspiration for yet.
  const availableTypes = useMemo(() => {
    const used = new Set(aspirations.map((a) => a.goalTypeCode));
    return goalTypes
      .filter((t) => t.isActive && !used.has(t.code))
      .sort((a, b) => a.defaultPriority - b.defaultPriority);
  }, [goalTypes, aspirations]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [types, list] = await Promise.all([
          getAspirationTypes(),
          getAspirations(),
        ]);
        if (cancelled) return;
        setGoalTypes(Array.isArray(types) ? types : []);
        setAspirations(Array.isArray(list) ? list : []);
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

  /** Re-fetch aspirations and the roadmap tasks after a mutation. */
  const refreshAfterMutation = async () => {
    const [list, goalsRes] = await Promise.all([getAspirations(), getGoals()]);
    setAspirations(Array.isArray(list) ? list : []);
    const goals: UserGoal[] = Array.isArray(goalsRes.data) ? goalsRes.data : [];
    setStoreGoals(goals);
  };

  const startAdd = () => {
    const first = availableTypes[0];
    if (!first) return;
    setError("");
    setEditingId(null);
    setForm({ goalTypeCode: first.code, amount: "", date: "", attributes: {} });
  };

  const startEdit = (asp: Aspiration) => {
    setError("");
    setEditingId(asp.aspirationId);
    setForm({
      goalTypeCode: asp.goalTypeCode,
      // targetAmount is a DECIMAL string (e.g. "400000.00"); take the whole
      // part as digits — don't strip the dot or the ".00" becomes extra zeros.
      amount:
        asp.targetAmount == null
          ? ""
          : String(Math.round(Number(asp.targetAmount))),
      date: asp.targetDate ? asp.targetDate.slice(0, 10) : "",
      attributes: { ...(asp.attributes ?? {}) },
    });
  };

  const cancelForm = () => {
    setForm(null);
    setEditingId(null);
    setError("");
  };

  const setAttr = (key: string, value: unknown) => {
    setForm((prev) =>
      prev
        ? { ...prev, attributes: { ...prev.attributes, [key]: value } }
        : prev,
    );
  };

  const handleSave = async () => {
    if (!form) return;
    const type = typeByCode.get(form.goalTypeCode);
    if (!type) return;

    setError("");
    setIsSaving(true);
    try {
      // Drop undefined attribute values before sending.
      const attributes = Object.fromEntries(
        Object.entries(form.attributes).filter(([, v]) => v !== undefined),
      );
      const hasAttributes = Object.keys(attributes).length > 0;
      const showDate =
        type.supportsTimeframe && !hasTimeframeAttr(type) && !!form.date;

      if (editingId) {
        const payload: UpdateAspirationPayload = {};
        if (type.supportsAmount) {
          payload.targetAmount = form.amount === "" ? 0 : Number(form.amount);
        }
        if (showDate) payload.targetDate = form.date;
        if (hasAttributes) payload.attributes = attributes;
        await updateAspiration(editingId, payload);
      } else {
        const payload: CreateAspirationPayload = {
          goalTypeCode: form.goalTypeCode,
        };
        if (type.supportsAmount && form.amount !== "") {
          payload.targetAmount = Number(form.amount);
        }
        if (showDate) payload.targetDate = form.date;
        if (hasAttributes) payload.attributes = attributes;
        await createAspiration(payload);
      }

      await refreshAfterMutation();
      setForm(null);
      setEditingId(null);
    } catch (err) {
      setError(errorMessage(err, "שגיאה בשמירה — נסה שוב"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (aspirationId: string) => {
    setError("");
    setDeletingId(aspirationId);
    try {
      await deleteAspiration(aspirationId);
      if (editingId === aspirationId) cancelForm();
      await refreshAfterMutation();
    } catch (err) {
      setError(errorMessage(err, "שגיאה במחיקה — נסה שוב"));
    } finally {
      setDeletingId(null);
    }
  };

  const renderAttributeField = (spec: GoalAttributeSpec) => {
    if (!form) return null;
    const value = form.attributes[spec.key];
    const id = `attr-${spec.key}`;
    const label = labelText(spec.label) || spec.key;

    if (spec.type === "boolean") {
      return (
        <div key={spec.key} className="flex items-center gap-2">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setAttr(spec.key, e.target.checked)}
          />
          <Label htmlFor={id} className="text-xs text-muted-foreground">
            {label}
          </Label>
        </div>
      );
    }

    if (spec.type === "date") {
      return (
        <div key={spec.key} className="space-y-1">
          <Label htmlFor={id} className="text-xs text-muted-foreground">
            {label}
          </Label>
          <Input
            id={id}
            type="date"
            dir="ltr"
            value={typeof value === "string" ? value.slice(0, 10) : ""}
            onChange={(e) =>
              setAttr(
                spec.key,
                e.target.value === "" ? undefined : e.target.value,
              )
            }
          />
        </div>
      );
    }

    if (spec.type === "string[]") {
      return (
        <div key={spec.key} className="space-y-1">
          <Label htmlFor={id} className="text-xs text-muted-foreground">
            {label}
          </Label>
          <Input
            id={id}
            type="text"
            value={Array.isArray(value) ? value.join(", ") : ""}
            onChange={(e) =>
              setAttr(
                spec.key,
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </div>
      );
    }

    if (spec.type === "number") {
      return (
        <div key={spec.key} className="space-y-1">
          <Label htmlFor={id} className="text-xs text-muted-foreground">
            {label}
          </Label>
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            min={0}
            dir="ltr"
            className="text-end"
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(e) =>
              setAttr(
                spec.key,
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
          />
        </div>
      );
    }

    // string
    return (
      <div key={spec.key} className="space-y-1">
        <Label htmlFor={id} className="text-xs text-muted-foreground">
          {label}
        </Label>
        <Input
          id={id}
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) =>
            setAttr(spec.key, e.target.value === "" ? undefined : e.target.value)
          }
        />
      </div>
    );
  };

  const renderForm = () => {
    if (!form) return null;
    const type = typeByCode.get(form.goalTypeCode);
    if (!type) return null;
    const showDate = type.supportsTimeframe && !hasTimeframeAttr(type);

    return (
      <div className="rounded-lg border border-primary/40 px-3 py-3 space-y-3">
        {/* Goal type picker (only when adding a new goal) */}
        {editingId === null ? (
          <div className="space-y-1">
            <Label htmlFor="goal-type" className="text-xs text-muted-foreground">
              סוג יעד
            </Label>
            <select
              id="goal-type"
              dir="rtl"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={form.goalTypeCode}
              onChange={(e) =>
                setForm({
                  goalTypeCode: e.target.value,
                  amount: "",
                  date: "",
                  attributes: {},
                })
              }
            >
              {availableTypes.map((t) => (
                <option key={t.code} value={t.code}>
                  {labelText(t.label)}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-sm font-semibold text-foreground">
            {labelText(type.label)}
          </p>
        )}

        {/* Amount — only when the type supports it */}
        {type.supportsAmount && (
          <div className="space-y-1">
            <Label
              htmlFor="goal-amount"
              className="text-xs text-muted-foreground"
            >
              סכום יעד (₪)
            </Label>
            <Input
              id="goal-amount"
              type="text"
              inputMode="numeric"
              dir="ltr"
              className="text-end"
              value={formatThousands(form.amount)}
              onChange={(e) =>
                setForm((prev) =>
                  prev
                    ? { ...prev, amount: parseThousands(e.target.value) }
                    : prev,
                )
              }
            />
          </div>
        )}

        {/* Explicit target date — only when the type supports a timeframe and
            doesn't capture it via an attribute. */}
        {showDate && (
          <div className="space-y-1">
            <Label htmlFor="goal-date" className="text-xs text-muted-foreground">
              תאריך יעד
            </Label>
            <Input
              id="goal-date"
              type="date"
              dir="ltr"
              value={form.date}
              onChange={(e) =>
                setForm((prev) =>
                  prev ? { ...prev, date: e.target.value } : prev,
                )
              }
            />
          </div>
        )}

        {/* Dynamic attribute fields from the type's schema */}
        {type.attributeSchema?.map((spec) => renderAttributeField(spec))}

        {error && <p className="text-xs text-destructive">{error}</p>}

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
            onClick={cancelForm}
            disabled={isSaving}
            className="flex items-center gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            ביטול
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card p-5" dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">היעדים שלי</h3>
        </div>
        {!isLoading && !form && availableTypes.length > 0 && (
          <button
            type="button"
            onClick={startAdd}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted active:scale-95"
          >
            <Plus className="h-3 w-3" />
            הוספת יעד
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {aspirations.length === 0 && !form && (
            <p className="text-sm text-muted-foreground">
              עדיין לא הגדרת יעדים. הוסף/י יעד כדי להתחיל.
            </p>
          )}

          {/* New-goal form */}
          {form && editingId === null && renderForm()}

          {aspirations.map((asp) => {
            const type = typeByCode.get(asp.goalTypeCode);
            const isEditingThis = editingId === asp.aspirationId;

            if (isEditingThis) {
              return <div key={asp.aspirationId}>{renderForm()}</div>;
            }

            const amount =
              asp.targetAmount == null ? null : Number(asp.targetAmount);
            const dateText = formatDate(asp.targetDate);

            return (
              <div
                key={asp.aspirationId}
                className="rounded-lg border border-border/60 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {asp.title || labelText(type?.label)}
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(asp)}
                      disabled={!!form}
                      aria-label="עריכת יעד"
                      className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted active:scale-95 disabled:opacity-50"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(asp.aspirationId)}
                      disabled={!!form || deletingId === asp.aspirationId}
                      aria-label="מחיקת יעד"
                      className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-destructive transition hover:bg-destructive/10 active:scale-95 disabled:opacity-50"
                    >
                      {deletingId === asp.aspirationId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2 space-y-1 text-sm">
                  {amount != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">סכום יעד</span>
                      <span className="font-medium">
                        ₪{amount.toLocaleString("he-IL")}
                      </span>
                    </div>
                  )}
                  {dateText && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">תאריך יעד</span>
                      <span className="font-medium">{dateText}</span>
                    </div>
                  )}
                  {asp.attributes &&
                    Object.entries(asp.attributes).map(([key, value]) => {
                      const spec = type?.attributeSchema?.find(
                        (a) => a.key === key,
                      );
                      const label = labelText(spec?.label) || key;
                      const display = Array.isArray(value)
                        ? value.join(", ")
                        : String(value);
                      return (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium">{display}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}

          {/* Surface errors that occur outside the form (e.g. delete) */}
          {error && !form && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
}
