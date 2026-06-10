import { MapPin, Brain, Bell, BookOpen, Target, TrendingDown } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Personalized Roadmap",
    description: "Get a step-by-step financial journey tailored to where you are today and where you want to be.",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Our intelligent engine analyzes your financial data to provide actionable recommendations.",
  },
  {
    icon: TrendingDown,
    title: "Loss Alerts",
    description: "Visualize what inaction costs you. Turn opportunity costs into motivation to take action.",
  },
  {
    icon: Target,
    title: "Micro-Goals",
    description: "Break down intimidating financial goals into achievable daily tasks you'll actually complete.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Receive timely reminders and celebrate milestones to keep your momentum going.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Hub",
    description: "Access a curated library of financial education to boost your literacy and confidence.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="container max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to
            <span className="gradient-text"> Level Up</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            NextStep combines behavioral finance principles with modern technology to help young adults overcome financial paralysis.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-6 group hover:border-primary/40 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
