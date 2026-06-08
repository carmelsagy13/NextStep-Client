import { TrendingUp, Wallet, PiggyBank, CreditCard } from "lucide-react";

const stats = [
  {
    icon: Wallet,
    label: "Monthly Income",
    value: "₪12,500",
    change: "+5.2%",
    positive: true,
  },
  {
    icon: CreditCard,
    label: "Monthly Expenses",
    value: "₪8,200",
    change: "-3.1%",
    positive: true,
  },
  {
    icon: PiggyBank,
    label: "Total Savings",
    value: "₪45,000",
    change: "+₪2,300",
    positive: true,
  },
  {
    icon: TrendingUp,
    label: "Net Worth Growth",
    value: "+12.4%",
    change: "This Year",
    positive: true,
  },
];

const DashboardPreview = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="container max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Your Financial
            <span className="gradient-text"> Dashboard</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time insights synced with your bank accounts through secure Open Banking integration.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.positive 
                    ? "bg-primary/10 text-primary" 
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-display font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div className="glass-card-elevated p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display text-xl font-semibold">Monthly Overview</h3>
              <p className="text-sm text-muted-foreground">January 2026</p>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                Income
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
                Expenses
              </div>
            </div>
          </div>

          {/* Chart placeholder */}
          <div className="h-64 relative">
            {/* Simplified chart visualization */}
            <div className="absolute inset-0 flex items-end justify-around gap-2 px-4">
              {[65, 45, 80, 55, 70, 40, 85, 60, 75, 50, 90, 70].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                  <div 
                    className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80"
                    style={{ 
                      height: `${height}%`,
                      background: i % 2 === 0 
                        ? 'linear-gradient(180deg, hsl(168 76% 52%) 0%, hsl(168 76% 42%) 100%)'
                        : 'linear-gradient(180deg, hsl(220 30% 25%) 0%, hsl(220 30% 18%) 100%)'
                    }}
                  />
                </div>
              ))}
            </div>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-muted-foreground py-2">
              <span>₪15k</span>
              <span>₪10k</span>
              <span>₪5k</span>
              <span>₪0</span>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-around mt-4 text-xs text-muted-foreground">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
