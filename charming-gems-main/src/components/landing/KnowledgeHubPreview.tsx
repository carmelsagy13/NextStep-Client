import { BookOpen, TrendingUp, Shield, Landmark, Coins, GraduationCap } from "lucide-react";

const categories = [
  {
    icon: TrendingUp,
    title: "Investing Basics",
    articles: 24,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Shield,
    title: "Emergency Funds",
    articles: 12,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Landmark,
    title: "Pension & Retirement",
    articles: 18,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Coins,
    title: "Budgeting Tips",
    articles: 31,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: GraduationCap,
    title: "Financial Literacy",
    articles: 42,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: BookOpen,
    title: "Market Insights",
    articles: 15,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const KnowledgeHubPreview = () => {
  return (
    <section className="py-24 px-4 relative">
      {/* Background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(168_76%_52%_/_0.05)_0%,_transparent_60%)]" />
      
      <div className="container max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            The Smart
            <span className="gradient-text"> Knowledge Hub</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Build your financial confidence with our curated library of educational content—from beginner basics to advanced strategies.
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.title} className="knowledge-card group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${category.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold mb-0.5">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.articles} articles</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured article preview */}
        <div className="mt-12 glass-card-elevated p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                <GraduationCap className="w-4 h-4" />
                Featured Article
              </div>
              <h3 className="font-display text-2xl font-bold">
                Understanding the Financial Hierarchy of Needs
              </h3>
              <p className="text-muted-foreground">
                Just like Maslow's hierarchy, your financial journey follows a logical progression. Learn why building an emergency fund comes before investing, and how to know when you're ready for the next step.
              </p>
              <button className="text-primary font-semibold hover:underline inline-flex items-center gap-2">
                Read Article →
              </button>
            </div>
            <div className="w-full md:w-64 h-48 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">8 min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KnowledgeHubPreview;
