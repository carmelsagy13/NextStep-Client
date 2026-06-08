import { Check, Lock } from "lucide-react";

const roadmapSteps = [
  {
    title: "Build Emergency Fund",
    description: "Create a safety net with 3-6 months of expenses",
    status: "completed",
    progress: 100,
  },
  {
    title: "Clear High-Interest Debt",
    description: "Eliminate costly debt holding you back",
    status: "completed",
    progress: 100,
  },
  {
    title: "Start Investing",
    description: "Begin your journey in the capital markets",
    status: "active",
    progress: 45,
  },
  {
    title: "Maximize Tax-Advantaged Accounts",
    description: "Optimize pension funds and provident accounts",
    status: "locked",
    progress: 0,
  },
  {
    title: "Build Long-Term Wealth",
    description: "Advanced strategies for financial independence",
    status: "locked",
    progress: 0,
  },
];

const RoadmapPreview = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-6">
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Your Financial
              <span className="gradient-text"> Hierarchy</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Based on the Financial Hierarchy of Needs, NextStep guides you
              through each stage of financial maturity—from stability to wealth
              building.
            </p>

            {/* Loss alert preview */}
            <div className="loss-alert">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent text-lg">⚠️</span>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">
                    Opportunity Cost Alert
                  </p>
                  <p className="text-sm text-muted-foreground">
                    By keeping ₪15,000 in your checking account instead of
                    investing, you're missing out on{" "}
                    <span className="gradient-text-accent font-bold">
                      ₪450/month
                    </span>{" "}
                    in potential returns.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Roadmap visualization */}
          <div className="glass-card-elevated p-8">
            <h3 className="font-display text-lg font-semibold mb-6">
              Your Progress
            </h3>

            <div className="space-y-0">
              {roadmapSteps.map((step) => (
                <div key={step.title} className={`roadmap-step ${step.status}`}>
                  {/* Status icon */}
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full flex items-center justify-center">
                    {step.status === "completed" && (
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                    {step.status === "active" && (
                      <div className="w-4 h-4 rounded-full bg-primary/30 border-2 border-primary animate-pulse" />
                    )}
                    {step.status === "locked" && (
                      <div className="w-4 h-4 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                        <Lock className="w-2 h-2 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div
                    className={`${step.status === "locked" ? "opacity-50" : ""}`}
                  >
                    <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {step.description}
                    </p>

                    {step.status !== "locked" && (
                      <div className="progress-bar w-32">
                        <div
                          className="progress-fill"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapPreview;
