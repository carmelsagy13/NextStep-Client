import { Check, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Stage {
  id: number;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  status: string;
  progress: number;
  lossAmount: string | null;
}

interface RoadmapStepsProps {
  stages: Stage[];
  currentIndex: number;
  onStageSelect: (index: number) => void;
}

const RoadmapSteps = ({ stages, currentIndex, onStageSelect }: RoadmapStepsProps) => {
  const prevStage = currentIndex > 0 ? stages[currentIndex - 1] : null;
  const currentStage = stages[currentIndex];
  const nextStage = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;

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
      opacity: 0.5, 
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

  const renderSmallStep = (stage: Stage, position: 'prev' | 'next') => {
    const Icon = stage.icon;
    const isLocked = stage.status === 'locked';
    const isCompleted = stage.status === 'completed';
    const showLossAlert = position === 'next' && isLocked && stage.lossAmount;
    
    return (
      <div className="relative">
      {/* Loss alert bubble next to step */}
        {showLossAlert && (
          <div className="absolute top-1/2 -translate-y-1/2 -left-32 z-30">
            <div className="relative bg-card/95 backdrop-blur-sm border-2 border-destructive/20 px-4 py-2.5 rounded-3xl shadow-lg text-center whitespace-nowrap">
              <div className="text-[10px] text-muted-foreground leading-tight">את מפסידה</div>
              <div className="text-base font-bold text-destructive leading-tight">{stage.lossAmount}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">כל עוד את לא מתקדמת</div>
              {/* Arrow pointing right - rotated square with matching border */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-[7px] w-3 h-3 rotate-45 bg-card/95 border-r-2 border-t-2 border-destructive/20" />
            </div>
          </div>
        )}
        
        <button
          onClick={() => onStageSelect(stages.indexOf(stage))}
          className={`
            relative w-14 h-14 rounded-full flex items-center justify-center
            transition-all duration-500 ease-out cursor-pointer hover:scale-110
            ${isLocked 
              ? 'bg-muted border-2 border-border' 
              : 'bg-gradient-to-br ' + stage.color
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
    const isCompleted = currentStage.status === 'completed';
    
    return (
      <button
        onClick={() => onStageSelect(currentIndex)}
        className="relative cursor-pointer transition-transform duration-300 hover:scale-105"
      >
        {/* Main circle with progress ring */}
        <div className="relative w-40 h-40">
          {/* Progress ring background */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="72"
              fill="none"
              stroke="hsl(var(--primary) / 0.15)"
              strokeWidth="8"
            />
            {/* Progress ring - uses primary color */}
            <circle
              cx="80"
              cy="80"
              r="72"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 72}`}
              strokeDashoffset={`${2 * Math.PI * 72 * (1 - currentStage.progress / 100)}`}
              className="drop-shadow-sm"
            />
          </svg>
          
          {/* Inner glass circle with primary outline and solid background */}
          <div className="absolute inset-4 rounded-full bg-card border-2 border-primary/30 shadow-lg flex flex-col items-center justify-center ring-4 ring-background">
            {/* Icon with primary color */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            
            {/* Stage name */}
            <span className="font-display text-sm font-semibold text-foreground text-center px-4 leading-tight">
              {currentStage.name}
            </span>
            
            {/* Progress percentage */}
            <span className="text-2xl font-bold text-primary mt-1">
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
              {renderSmallStep(prevStage, 'prev')}
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
              {renderSmallStep(nextStage, 'next')}
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
              ${index === currentIndex 
                ? 'w-6 bg-primary' 
                : stage.status === 'locked' 
                  ? 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50' 
                  : 'w-2 bg-primary/40 hover:bg-primary/60'
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
