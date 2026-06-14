import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  CheckCircle2,
  Loader2,
  Check,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { useRoadmapStore } from "../store/roadmapStore";
import { updateGoal } from "../api/goals.api";
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
  const markGoalComplete = useRoadmapStore((s) => s.markGoalComplete);
  const [completing, setCompleting] = useState(false);

  const isCompleted = goal.status === UserGoalStatus.COMPLETED;
  const hasTarget = goal.targetAmount != null && Number(goal.targetAmount) > 0;
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

  // Optional link to an explanatory article (mostly from the data center).
  const infoLink = resolveInfoLink(goal.dynamicParams?.bank_info_link);

  const handleMarkComplete = async () => {
    if (isCompleted || completing) return;
    setCompleting(true);
    try {
      await updateGoal(goal.goalId, {
        status: UserGoalStatus.COMPLETED,
        ...(goal.targetAmount != null && Number(goal.targetAmount) > 0
          ? { currentAmount: Number(goal.targetAmount) }
          : {}),
      });
      markGoalComplete(goal.goalId);
    } catch {
      // Silently revert on error — the store is unchanged because we
      // only called markGoalComplete on success.
    } finally {
      setCompleting(false);
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
          {isCompleted && (
            <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
          <div>
            <p
              className={`text-sm font-semibold ${
                isCompleted
                  ? "text-gray-400 line-through dark:text-gray-500"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {goal.goalName}
            </p>

            {/* Description from template */}
            {description && !isCompleted && (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            )}

            {/* AI Insight */}
            {goal.aiInsight && !isCompleted && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                {goal.aiInsight}
              </p>
            )}

            {/* Link to an explanatory article */}
            {infoLink && !isCompleted && (
              infoLink.isInternal ? (
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
              )
            )}

            {/* Monetary progress (only when there's a numeric target) */}
            {hasTarget && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
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
            )}
          </div>
        </div>

        {/* Mark complete button */}
        {!isCompleted && (
          <button
            type="button"
            onClick={handleMarkComplete}
            disabled={completing}
            aria-label={`Mark "${goal.goalName}" as complete`}
            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground transition
              hover:bg-primary/90 active:scale-95
              disabled:cursor-not-allowed disabled:opacity-60"
          >
            {completing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            סיימתי
          </button>
        )}
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
}

export default function GoalList({ animatingGoalIds }: GoalListProps = {}) {
  const allGoals = useRoadmapStore((s) => s.goals);

  // Only show goals the user is currently working on (active) or has
  // finished (completed). Hide removed/abandoned/expired goals.
  const goals = (allGoals ?? []).filter(
    (g) =>
      g.status === UserGoalStatus.ACTIVE ||
      g.status === UserGoalStatus.COMPLETED,
  );

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
            המשימות שלך
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
