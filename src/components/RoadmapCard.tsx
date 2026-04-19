import { MapPin, ChevronRight } from 'lucide-react';
import { useRoadmapStore } from '../store/roadmapStore';

const STEP_LABELS: Record<number, string> = {
  1: 'Basic Needs & Cash Flow',
  2: 'Financial Safety',
  3: 'Wealth Accumulation',
  4: 'Financial Freedom',
  5: 'Future & Legacy Creation',
};

export default function RoadmapCard() {
  const roadmapState = useRoadmapStore((s) => s.roadmapState);

  if (!roadmapState) return null;

  const { currentStepId, progressPercent } = roadmapState;
  const stepTitle = roadmapState.currentStep?.title ?? STEP_LABELS[currentStepId] ?? `Step ${currentStepId}`;
  const stepDescription = roadmapState.currentStep?.description;
  const progress = Math.max(0, Math.min(100, progressPercent));

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-violet-200 bg-white shadow-md dark:border-violet-800 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-violet-100 dark:border-violet-800/60 bg-violet-50 dark:bg-violet-950/40 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 shadow-sm">
          <MapPin className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-violet-500 dark:text-violet-400">
            Your Roadmap
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Financial Hierarchy of Needs
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-5 space-y-5">
        {/* Step badge + title */}
        <div className="flex items-center gap-4">
          <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 shadow-sm min-w-[72px]">
            <span className="text-2xl font-bold text-white leading-none">{currentStepId}</span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-violet-200">
              Step
            </span>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{stepTitle}</p>
            {stepDescription && (
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {stepDescription}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Progress</span>
            <span className="font-semibold text-violet-600 dark:text-violet-400">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-violet-600 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step breadcrumbs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5].map((step, idx) => (
            <div key={step} className="flex items-center gap-1 shrink-0">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                  step < currentStepId
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                    : step === currentStepId
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                }`}
              >
                {step}
              </span>
              {idx < 4 && (
                <ChevronRight className="h-3 w-3 shrink-0 text-gray-300 dark:text-gray-600" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
