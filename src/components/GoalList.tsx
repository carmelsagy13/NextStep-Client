import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Loader2,
  Check,
  Pencil,
  X,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { useRoadmapStore } from "../store/roadmapStore";
import { updateGoal } from "../api/goals.api";
import { formatThousands, parseThousands } from "../lib/utils";
import type { UserGoal } from "../types";
import { UserGoalStatus } from "../types";

/** Interpolates {{key}} placeholders in a template using the dynamicParams object. */
function renderDescription(
  template: string,
  params: Record<string, unknown>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = params[key];
    if (val == null) return "";
    if (typeof val === "number") return val.toLocaleString("he-IL");
    return String(val);
  });
}

/**
 * Resolves a `bank_info_link` value into something the goal card can render.
 * Absolute URLs that point at this app are converted to internal SPA routes
 * (so React Router handles them without a full page reload); anything else
 * is treated as an external link opened in a new tab.
 */
function resolveInfoLink(
  raw: unknown,
): { href: string; isInternal: boolean } | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const value = raw.trim();

  // Already a relative path (e.g. "/article/compound-interest")
  if (value.startsWith("/")) {
    return { href: value, isInternal: true };
  }

  try {
    const url = new URL(value);
    const isSameOrigin = url.origin === window.location.origin;
    // Treat known in-app routes as internal even across ports/hosts, since the
    // links are authored against a dev origin (e.g. localhost:5173).
    const isAppRoute = /^\/(article|category|data-center)\b/.test(url.pathname);
    if (isSameOrigin || isAppRoute) {
      return { href: url.pathname + url.search + url.hash, isInternal: true };
    }
    return { href: value, isInternal: false };
  } catch {
    return null;
  }
}

function GoalItem({
  goal,
  isAnimating,
}: {
  goal: UserGoal;
  isAnimating?: boolean;
}) {
  const setGoalStatus = useRoadmapStore((s) => s.setGoalStatus);
  const updateGoalProgress = useRoadmapStore((s) => s.updateGoalProgress);
  const [toggling, setToggling] = useState(false);
  const [editingAmount, setEditingAmount] = useState(false);
  const [amountDraft, setAmountDraft] = useState("");
  const [savingAmount, setSavingAmount] = useState(false);
  const [error, setError] = useState("");

  const isCompleted = goal.status === UserGoalStatus.COMPLETED;
  const hasTarget = goal.targetAmount != null && Number(goal.targetAmount) > 0;
  // Derived percentage: (currentAmount / targetAmount) * 100, clamped to 100.
  const progress = hasTarget
    ? Math.min(
        100,
        Math.round(
          (Number(goal.currentAmount) / Number(goal.targetAmount!)) * 100,
        ),
      )
    : 0;

  // Build a meaningful description from the template + dynamic params
  const description = goal.roadmapGoal?.descriptionTemplate
    ? renderDescription(
        goal.roadmapGoal.descriptionTemplate,
        goal.dynamicParams ?? {},
      )
    : null;

  // Interpolate goal name if it contains placeholders like {{goal}}
  const displayName = renderDescription(
    goal.goalName,
    goal.dynamicParams ?? {},
  );

  // Optional link to an explanatory article (mostly from the data center).
  const infoLink = resolveInfoLink(goal.dynamicParams?.bank_info_link);

  // Toggle the task between COMPLETED and ACTIVE. Optimistically flips the
  // status in the store and reverts if the API call fails.
  const handleToggleComplete = async () => {
    if (toggling) return;
    setError("");
    setToggling(true);
    const prevStatus = goal.status;
    const nextStatus = isCompleted
      ? UserGoalStatus.ACTIVE
      : UserGoalStatus.COMPLETED;
    setGoalStatus(goal.goalId, nextStatus); // optimistic
    try {
      await updateGoal(goal.goalId, { status: nextStatus });
    } catch {
      setGoalStatus(goal.goalId, prevStatus); // revert
      setError("שגיאה בעדכון — נסה שוב");
    } finally {
      setToggling(false);
    }
  };

  const startEditAmount = () => {
    // currentAmount may be a decimal string ("2000.00"); take the whole part.
    setAmountDraft(String(Math.round(Number(goal.currentAmount) || 0)));
    setError("");
    setEditingAmount(true);
  };

  const cancelEditAmount = () => {
    setEditingAmount(false);
    setError("");
  };

  // Save a manually-typed progress amount. Optimistically updates the store
  // (which re-derives status/percentage) and reverts on failure.
  const handleSaveAmount = async () => {
    if (savingAmount) return;
    setError("");
    setSavingAmount(true);
    const amount = amountDraft === "" ? 0 : Number(amountDraft);
    const prevAmount = Number(goal.currentAmount) || 0;
    updateGoalProgress(goal.goalId, amount); // optimistic
    try {
      await updateGoal(goal.goalId, { currentAmount: amount });
      setEditingAmount(false);
    } catch {
      updateGoalProgress(goal.goalId, prevAmount); // revert
      setError("שגיאה בשמירה — נסה שוב");
    } finally {
      setSavingAmount(false);
    }
  };

  return (
    <div
      dir="rtl"
      className={`rounded-sm border px-4 py-4 transition-colors ${
        isCompleted
          ? "border-primary/30 bg-primary/10"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      } ${isAnimating ? "animate-goal-check" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon + name */}
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={isCompleted}
            aria-label={
              isCompleted ? "סמן את המשימה כלא הושלמה" : "סמן את המשימה כהושלמה"
            }
            onClick={handleToggleComplete}
            disabled={toggling}
            className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition active:scale-95 disabled:opacity-50 ${
              isCompleted
                ? "bg-primary border-primary"
                : "border-gray-300 hover:border-primary dark:border-gray-600"
            }`}
          >
            {toggling ? (
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            ) : isCompleted ? (
              <Check className="h-3 w-3 text-primary-foreground" />
            ) : null}
          </button>
          <div>
            <p
              className={`text-sm font-semibold ${
                isCompleted
                  ? "text-gray-400 line-through dark:text-gray-500"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {displayName}
            </p>

            {/* Description from template */}
            {description && !isCompleted && (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            )}

            {/* Link to an explanatory article */}
            {infoLink &&
              !isCompleted &&
              (infoLink.isInternal ? (
                <Link
                  to={infoLink.href}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  למדו עוד על המשימה הזו
                </Link>
              ) : (
                <a
                  href={infoLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  למדו עוד על המשימה הזו
                </a>
              ))}

            {/* Monetary progress (only when there's a numeric target) */}
            {hasTarget &&
              (editingAmount ? (
                <div className="mt-2 flex items-center gap-1.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    autoFocus
                    value={formatThousands(amountDraft)}
                    onChange={(e) =>
                      setAmountDraft(parseThousands(e.target.value))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveAmount();
                      if (e.key === "Escape") cancelEditAmount();
                    }}
                    aria-label="סכום התקדמות נוכחי"
                    className="w-28 rounded-md border border-gray-300 bg-white px-2 py-1 text-end text-xs dark:border-gray-700 dark:bg-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAmount}
                    disabled={savingAmount}
                    aria-label="שמור התקדמות"
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                  >
                    {savingAmount ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditAmount}
                    disabled={savingAmount}
                    aria-label="ביטול"
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 text-gray-500 transition hover:bg-gray-100 active:scale-95 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="mt-1.5 flex items-center gap-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ₪{Number(goal.currentAmount).toLocaleString()} / ₪
                    {Number(goal.targetAmount).toLocaleString()}
                    {goal.targetDate && (
                      <>
                        {" "}
                        &middot; עד{" "}
                        {new Date(goal.targetDate).toLocaleDateString("he-IL", {
                          month: "short",
                          year: "numeric",
                        })}
                      </>
                    )}
                  </p>
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={startEditAmount}
                      aria-label="עדכון התקדמות"
                      className="shrink-0 text-gray-400 transition hover:text-primary active:scale-95"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}

            {error && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {!isCompleted && hasTarget && (
        <div className="mt-3 space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-sm bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-sm bg-black dark:bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-left text-[10px] text-gray-400">{progress}%</p>
        </div>
      )}
    </div>
  );
}

interface GoalListProps {
  /** Set of goalIds that should play the check-in animation. */
  animatingGoalIds?: Set<string>;
  /** Only show goals belonging to this roadmap step. */
  stepId?: number;
  /** The user's current roadmap step. */
  currentStepId?: number;
  /** "current" shows active goals; "past" shows completed goals. */
  mode?: "current" | "past";
  /** Overrides the default header text. */
  title?: string;
}

export default function GoalList({
  animatingGoalIds,
  stepId,
  mode = "current",
  title,
}: GoalListProps = {}) {
  const allGoals = useRoadmapStore((s) => s.goals);

  // Only show goals the user is currently working on (active) or has
  // finished (completed). Hide removed/abandoned/expired goals.
  const goals = (allGoals ?? []).filter((g) => {
    if (stepId != null && g.roadmapGoal?.stepId !== stepId) return false;
    if (mode === "past") return g.status === UserGoalStatus.COMPLETED;
    return g.status === UserGoalStatus.ACTIVE;
  });

  if (goals.length === 0) return null;

  const completed = goals.filter(
    (g) => g.status === UserGoalStatus.COMPLETED,
  ).length;

  return (
    <div className="w-full max-w-lg mx-auto space-y-3" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-black dark:text-white" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {title ?? "המשימות שלך"}
          </h3>
        </div>
        <span className="text-xs text-gray-400">
          {completed}/{goals.length} הושלמו
        </span>
      </div>

      {/* Goal items */}
      <div className="space-y-2.5">
        {goals.map((goal) => (
          <GoalItem
            key={goal.goalId}
            goal={goal}
            isAnimating={animatingGoalIds?.has(goal.goalId)}
          />
        ))}
      </div>
    </div>
  );
}
