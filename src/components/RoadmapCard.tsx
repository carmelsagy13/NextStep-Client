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
    <div className="w-full max-w-lg mx-auto rounded-sm border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-black">
          <MapPin className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">
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
          <div className="flex shrink-0 flex-col items-center justify-center rounded-sm bg-black px-5 py-3 min-w-[72px]">
            <span className="text-2xl font-bold text-white leading-none">{currentStepId}</span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-300">
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
            <span className="font-semibold text-black dark:text-white">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-sm bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-sm bg-black dark:bg-white transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step breadcrumbs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5].map((step, idx) => (
            <div key={step} className="flex items-center gap-1 shrink-0">
              <span
                className={`rounded-sm px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                  step < currentStepId
                    ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    : step === currentStepId
                    ? 'bg-black text-white dark:bg-white dark:text-black'
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
