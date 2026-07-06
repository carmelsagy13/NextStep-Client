import { Check, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { LossAversion } from "@/types";
import { formatMoney } from "@/lib/utils";

interface Stage {
  id: number;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  status: string;
  progress: number;
  lossAversion: LossAversion | null;
}

interface RoadmapStepsProps {
  stages: Stage[];
  currentIndex: number;
  onStageSelect: (index: number) => void;
}

const RoadmapSteps = ({
  stages,
  currentIndex,
  onStageSelect,
}: RoadmapStepsProps) => {
  const prevStage = currentIndex > 0 ? stages[currentIndex - 1] : null;
  const currentStage = stages[currentIndex];
  const nextStage =
    currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;

  const stepVariants = {
    enter: (direction: number) => ({
      scale: 0.5,
      opacity: 0,
      x: direction > 0 ? 50 : -50,
      y: direction > 0 ? -30 : 30,
    }),
    center: {
      scale: 1,
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    exit: (direction: number) => ({
      scale: 0.5,
      opacity: 0,
      x: direction < 0 ? 50 : -50,
      y: direction < 0 ? -30 : 30,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    }),
  };

  const sideStepVariants = {
    initial: { opacity: 0, scale: 0.3 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.3,
      transition: {
        duration: 0.3,
      },
    },
  };

  const renderSmallStep = (stage: Stage, position: "prev" | "next") => {
    const Icon = stage.icon;
    const isLocked = stage.status === "locked";
    const isCompleted = stage.status === "completed";
    // Loss aversion nudge for the next stage (already gated to a positive
    // monthly loss when the stages were built).
    const loss = position === "next" && isLocked ? stage.lossAversion : null;

    return (
      <div className="relative">
        {/* Loss aversion bubble next to the next step */}
        {loss && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -left-56 z-30"
            dir="rtl"
          >
            <div className="relative w-52 rounded-3xl border-2 border-warning/40 bg-card px-4 py-2.5 text-center shadow-lg">
              {/* Clean, reliable one-liner — annual idle money */}
              <p className="text-xs font-medium leading-snug text-foreground">
                יש לך בערך{" "}
                <span className="font-bold text-warning">
                  {formatMoney(loss.annualLossAmount, loss.currency)}
                </span>{" "}
                בשנה שלא עובדים בשבילך
              </p>

              {/* Arrow pointing right toward the step circle */}
              <div className="absolute top-1/2 -right-[7px] h-3 w-3 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-warning/40 bg-card" />
            </div>
          </div>
        )}

        <button
          onClick={() => onStageSelect(stages.indexOf(stage))}
          className={`
            relative w-14 h-14 rounded-full flex items-center justify-center
            transition-all duration-500 ease-out cursor-pointer hover:scale-110
            opacity-50 hover:opacity-100
            ${
              isLocked
                ? "bg-muted border-2 border-border"
                : "bg-gradient-to-br " + stage.color
            }
            shadow-lg ring-4 ring-background
          `}
        >
          {isLocked ? (
            <Lock className="w-5 h-5 text-muted-foreground" />
          ) : isCompleted ? (
            <Check className="w-5 h-5 text-white" />
          ) : (
            <Icon className="w-5 h-5 text-white" />
          )}

          {/* Stage name label */}
          <div className="absolute -bottom-7 whitespace-nowrap text-xs font-medium">
            <span className="text-muted-foreground">{stage.name}</span>
          </div>
        </button>
      </div>
    );
  };

  const renderCurrentStep = () => {
    const Icon = currentStage.icon;
    const isCompleted = currentStage.status === "completed";

    return (
      <button
        onClick={() => onStageSelect(currentIndex)}
        className="relative cursor-pointer transition-transform duration-300 hover:scale-105"
      >
        {/* Main circle with progress ring */}
        <div className="relative w-48 h-48">
          {/* Progress ring background */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="86"
              fill="none"
              stroke="hsl(var(--primary) / 0.15)"
              strokeWidth="8"
            />
            {/* Progress ring - uses primary color */}
            <circle
              cx="96"
              cy="96"
              r="86"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 86}`}
              strokeDashoffset={`${2 * Math.PI * 86 * (1 - currentStage.progress / 100)}`}
              className="drop-shadow-sm"
            />
          </svg>

          {/* Inner glass circle with primary outline and solid background */}
          <div className="absolute inset-4 rounded-full bg-card border-2 border-primary/30 shadow-lg flex flex-col items-center justify-center gap-3 ring-4 ring-background">
            {/* Icon with primary color */}
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>

            {/* Stage name */}
            <span className="font-display text-sm font-semibold text-foreground text-center px-3 leading-tight">
              {currentStage.name}
            </span>

            {/* Progress percentage */}
            <span className="text-2xl font-bold text-primary">
              {currentStage.progress}%
            </span>
          </div>

          {/* Completed badge */}
          {isCompleted && (
            <div className="absolute top-2 right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
              <Check className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="relative py-12 px-4 min-h-[380px] flex items-center justify-center overflow-hidden">
      {/* Winding snake-like trail in background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 340"
        preserveAspectRatio="xMidYMid meet"
        style={{ zIndex: 0 }}
      >
        {/* Snaky S-curve path */}
        <path
          d="M 60 320
             C 20 280, 140 260, 100 220
             C 60 180, 180 160, 200 170
             C 220 180, 340 160, 300 120
             C 260 80, 380 40, 340 10"
          fill="none"
          stroke="hsl(var(--primary) / 0.25)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Steps container */}
      <div className="relative w-full max-w-sm h-72 flex items-center justify-center">
        {/* Previous step - bottom left on the trail */}
        <AnimatePresence mode="popLayout">
          {prevStage && (
            <motion.div
              key={`prev-${prevStage.id}`}
              className="absolute bottom-2 left-2 z-10"
              variants={sideStepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {renderSmallStep(prevStage, "prev")}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current step - center */}
        <AnimatePresence mode="popLayout" custom={1}>
          <motion.div
            key={`current-${currentStage.id}`}
            className="relative z-20"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={1}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>

        {/* Next step - top right on the trail */}
        <AnimatePresence mode="popLayout">
          {nextStage && (
            <motion.div
              key={`next-${nextStage.id}`}
              className="absolute -top-4 right-2 z-10"
              variants={sideStepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {renderSmallStep(nextStage, "next")}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage dots navigation */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {stages.map((stage, index) => (
          <button
            key={stage.id}
            onClick={() => onStageSelect(index)}
            className={`
              h-2 rounded-full transition-all duration-300 cursor-pointer
              ${
                index === currentIndex
                  ? "w-6 bg-primary"
                  : stage.status === "locked"
                    ? "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    : "w-2 bg-primary/40 hover:bg-primary/60"
              }
            `}
            aria-label={`Go to ${stage.name}`}
          />
        ))}
      </div>
    </div>
  );
};

export default RoadmapSteps;
