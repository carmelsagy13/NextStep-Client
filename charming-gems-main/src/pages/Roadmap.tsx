import { useState } from "react";
import { Button } from "@/components/ui/button";
import AppNavbar from "@/components/app/AppNavbar";
import RoadmapSteps from "@/components/roadmap/RoadmapSteps";
import { 
  Shield, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  Crown,
  Check,
  Circle,
  ChevronRight,
  Lock
} from "lucide-react";

// Financial Hierarchy of Needs - 5 stages
const financialStages = [
  {
    id: 1,
    name: "Financial Stability",
    subtitle: "Build Your Foundation",
    icon: Shield,
    color: "from-primary to-primary/80",
    bgColor: "bg-primary",
    description: "Cover your basic monthly obligations and create a budget that works.",
    tasks: [
      { title: "Track all monthly expenses for 30 days", completed: true },
      { title: "Create a realistic monthly budget", completed: true },
      { title: "Build 1 month expense buffer in checking", completed: true },
    ],
    status: "completed",
    progress: 100,
    lossAmount: null,
  },
  {
    id: 2,
    name: "Emergency Fund",
    subtitle: "Your Safety Net",
    icon: PiggyBank,
    color: "from-primary to-emerald-500",
    bgColor: "bg-primary",
    description: "Build 3-6 months of expenses as a safety net for unexpected events.",
    tasks: [
      { title: "Open a high-yield savings account", completed: true },
      { title: "Set up automatic monthly transfer of ₪1,500", completed: true },
      { title: "Reach 3 months of expenses (₪18,000)", completed: false },
      { title: "Reach 6 months of expenses (₪36,000)", completed: false },
    ],
    status: "active",
    progress: 65,
    lossAmount: null,
  },
  {
    id: 3,
    name: "Debt Freedom",
    subtitle: "Clear High-Interest Debt",
    icon: CreditCard,
    color: "from-accent to-orange-500",
    bgColor: "bg-accent",
    description: "Eliminate costly high-interest debt that's holding back your wealth.",
    tasks: [
      { title: "List all debts with interest rates", completed: false },
      { title: "Choose debt payoff strategy (avalanche/snowball)", completed: false },
      { title: "Pay off credit card debt", completed: false },
      { title: "Clear high-interest loans (>6%)", completed: false },
    ],
    status: "locked",
    progress: 0,
    lossAmount: "₪320/mo",
  },
  {
    id: 4,
    name: "Invest & Grow",
    subtitle: "Enter the Market",
    icon: TrendingUp,
    color: "from-primary/90 to-teal-400",
    bgColor: "bg-primary/90",
    description: "Start participating in the capital market for long-term wealth building.",
    tasks: [
      { title: "Complete investment basics course", completed: false },
      { title: "Open a tax-advantaged investment account", completed: false },
      { title: "Start monthly contributions of ₪500", completed: false },
      { title: "Build diversified portfolio", completed: false },
    ],
    status: "locked",
    progress: 0,
    lossAmount: "₪890/mo",
  },
  {
    id: 5,
    name: "Wealth Building",
    subtitle: "Financial Independence",
    icon: Crown,
    color: "from-accent to-amber-400",
    bgColor: "bg-accent",
    description: "Advanced strategies for financial independence and legacy building.",
    tasks: [
      { title: "Maximize pension contributions", completed: false },
      { title: "Build passive income streams", completed: false },
      { title: "Explore real estate investments", completed: false },
      { title: "Set up estate planning", completed: false },
    ],
    status: "locked",
    progress: 0,
    lossAmount: "₪2.1k/mo",
  },
];

const Roadmap = () => {
  // Find the active stage index (0-based)
  const activeIndex = financialStages.findIndex(s => s.status === "active");
  const [currentIndex, setCurrentIndex] = useState(activeIndex >= 0 ? activeIndex : 0);
  
  const currentStage = financialStages[currentIndex];

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < financialStages.length - 1 && 
    financialStages[currentIndex + 1]?.status !== "locked";

  const completedTasks = currentStage.tasks.filter(t => t.completed).length;
  const totalTasks = currentStage.tasks.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Road steps visualization */}
        <div className="flex-shrink-0 pt-4 pb-2 overflow-hidden">
          <RoadmapSteps
            stages={financialStages}
            currentIndex={currentIndex}
            onStageSelect={setCurrentIndex}
          />
        </div>

        {/* Tasks section */}
        <div className="flex-1 bg-muted/30 rounded-t-3xl border-t border-border px-4 pt-6 pb-8 mt-4">
          <div className="max-w-sm mx-auto">
            {/* Stage description */}
            <div className="glass-card p-4 mb-5">
              <p className="text-sm text-muted-foreground">
                {currentStage.description}
              </p>
            </div>

            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">
                Tasks to Complete
              </h3>
              <span className="text-sm text-muted-foreground">
                {completedTasks}/{totalTasks}
              </span>
            </div>

            {/* Task list */}
            <div className="space-y-3">
              {currentStage.tasks.map((task, index) => (
                <div 
                  key={index}
                  className={`
                    flex items-start gap-3 p-4 rounded-2xl transition-all
                    ${task.completed 
                      ? 'bg-primary/5 border border-primary/20' 
                      : 'bg-background border border-border shadow-sm'
                    }
                  `}
                >
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                    ${task.completed 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border-2 border-muted-foreground/30'
                    }
                  `}>
                    {task.completed ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Circle className="w-3 h-3 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-tight ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {task.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA for active stage */}
            {currentStage.status === "active" && (
              <div className="mt-6">
                <Button variant="hero" size="lg" className="w-full">
                  Complete Next Task
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  {totalTasks - completedTasks} tasks left to unlock the next stage
                </p>
              </div>
            )}

            {/* Message for completed stages */}
            {currentStage.status === "completed" && (
              <div className="mt-6 text-center p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <Check className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-primary">Stage Completed!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Great job! Move to the next stage to continue.
                </p>
              </div>
            )}

            {/* Message for locked stages - read only */}
            {currentStage.status === "locked" && (
              <div className="mt-6 text-center p-4 rounded-2xl bg-muted/50 border border-border">
                <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium text-muted-foreground">Stage Locked</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete previous stages to unlock this one.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
