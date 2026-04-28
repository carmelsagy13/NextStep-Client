import { useState } from 'react';
import { Target, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useRoadmapStore } from '../store/roadmapStore';
import { updateGoal } from '../api/goals.api';
import type { UserGoal } from '../types';

function GoalItem({ goal }: { goal: UserGoal }) {
  const markGoalComplete = useRoadmapStore((s) => s.markGoalComplete);
  const [completing, setCompleting] = useState(false);

  const isCompleted = goal.isCompleted;
  const hasTarget = goal.targetAmount != null && Number(goal.targetAmount) > 0;
  const progress = hasTarget
    ? Math.min(100, Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100))
    : 0;

  const handleMarkComplete = async () => {
    if (isCompleted || completing) return;
    setCompleting(true);
    try {
      // Explicitly persist is_completed = true to the DB.
      // Also set currentAmount to targetAmount when a numeric target exists.
      await updateGoal(goal.goalId, {
        isCompleted: true,
        ...(goal.targetAmount != null && Number(goal.targetAmount) > 0
          ? { currentAmount: Number(goal.targetAmount) }
          : {}),
      });
      // Update local state only after the API call succeeds.
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
      className={`rounded-sm border px-4 py-4 transition-colors ${
        isCompleted
          ? 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon + name */}
        <div className="flex items-start gap-2.5">
          {isCompleted ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
          ) : (
            <Circle className="mt-0.5 h-5 w-5 shrink-0 text-gray-300 dark:text-gray-600" />
          )}
          <div>
            <p
              className={`text-sm font-semibold ${
                isCompleted
                  ? 'text-gray-400 line-through dark:text-gray-500'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {goal.goalName}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {hasTarget
                ? `₪${Number(goal.currentAmount).toLocaleString()} / ₪${Number(goal.targetAmount).toLocaleString()}`
                : `₪${Number(goal.currentAmount).toLocaleString()} saved`}
              {goal.targetDate && (
                <> &middot; due {new Date(goal.targetDate).toLocaleDateString('en-IL', { month: 'short', year: 'numeric' })}</>
              )}
            </p>
          </div>
        </div>

        {/* Mark complete button */}
        {!isCompleted && (
          <button
            type="button"
            onClick={handleMarkComplete}
            disabled={completing}
            aria-label={`Mark "${goal.goalName}" as complete`}
            className="shrink-0 flex items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-black transition
              hover:bg-gray-50 active:scale-95
              disabled:cursor-not-allowed disabled:opacity-60
              dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
          >
            {completing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            Complete
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
          <p className="text-right text-[10px] text-gray-400">{progress}%</p>
        </div>
      )}
    </div>
  );
}

export default function GoalList() {
  const goals = useRoadmapStore((s) => s.goals);

  if (!goals || goals.length === 0) return null;

  const completed = goals.filter((g) => g.isCompleted).length;

  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-black dark:text-white" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Your Goals</h3>
        </div>
        <span className="text-xs text-gray-400">
          {completed}/{goals.length} completed
        </span>
      </div>

      {/* Goal items */}
      <div className="space-y-2.5">
        {goals.map((goal) => (
          <GoalItem key={goal.goalId} goal={goal} />
        ))}
      </div>
    </div>
  );
}
