import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import FinancialTip from "./FinancialTip";

/**
 * Loading phases shown while an LLM analysis request is in flight.
 * `startAt` is the elapsed time (ms) at which the phase becomes active.
 * `progress` is the target progress-bar value (0-100) for that phase.
 * The last phase has no end — it stays until the request resolves.
 */
const LOADING_PHASES = [
  { startAt: 0, progress: 15, label: "מתחבר ל-Open Finance..." },
  { startAt: 3_000, progress: 40, label: "יוצר חיבור מאובטח..." },
  { startAt: 7_000, progress: 70, label: "מאחזר תנועות פיננסיות..." },
  {
    startAt: 15_000,
    progress: 92,
    label: "מנתח נתונים עם מנגנון AI העוזר הפיננסי שלנו...",
  },
] as const;

interface Props {
  /** When true, the phase timeline starts advancing. Reset when it flips off. */
  active: boolean;
}

/**
 * Shared "analysis in progress" indicator: an animated phase label, a slim
 * progress bar and a rotating financial tip to keep the user engaged while a
 * slow LLM/Open-Finance request completes.
 *
 * Used both inline (bank sync panel) and inside the Demo Mode loading modal.
 */
export default function AnalysisLoadingIndicator({ active }: Props) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  // Cycle through loading phases while `active`. Timers are scheduled relative
  // to the moment loading starts, and are cleared when `active` flips off.
  useEffect(() => {
    if (!active) return;

    setPhaseIndex(0);
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < LOADING_PHASES.length; i++) {
      const t = setTimeout(() => setPhaseIndex(i), LOADING_PHASES[i].startAt);
      timeouts.push(t);
    }
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [active]);

  return (
    <div
      className="space-y-2.5 rounded-sm border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50"
      dir="rtl"
    >
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600" />
        <p
          key={phaseIndex}
          className="text-sm font-medium text-gray-700 transition-opacity dark:text-gray-200"
        >
          {LOADING_PHASES[phaseIndex].label}
        </p>
      </div>

      {/* Slim progress bar */}
      <div
        className="h-1 w-full overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-700"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={LOADING_PHASES[phaseIndex].progress}
      >
        <div
          className="h-full rounded-sm bg-blue-600 transition-all duration-700 ease-out"
          style={{ width: `${LOADING_PHASES[phaseIndex].progress}%` }}
        />
      </div>

      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        התהליך עשוי להימשך עד דקה. נא לא לסגור את החלון.
      </p>

      {/* Keep the user engaged with a financial tip during the wait. */}
      <FinancialTip />
    </div>
  );
}
