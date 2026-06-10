import AppNavbar from "@/components/app/AppNavbar";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Mail, Target, Wallet, GraduationCap, TrendingUp, PieChart } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const getKnowledgeLabel = (level?: string) => {
    switch (level) {
      case 'none': return 'Beginner';
      case 'basic': return 'Basic Understanding';
      case 'moderate': return 'Intermediate';
      case 'experienced': return 'Experienced';
      case 'expert': return 'Expert';
      default: return 'Not set';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />
      
      <main className="flex-1 p-4">
        <div className="max-w-lg mx-auto">
          <h1 className="font-display text-2xl font-bold mb-6">My Profile</h1>
          
          {/* User info card */}
          <div className="glass-card-elevated p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                {user?.name && (
                  <h2 className="font-display text-xl font-bold">{user.name}</h2>
                )}
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email || 'No email'}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Overview Cards */}
          <div className="grid gap-4 mb-6">
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-semibold">Net Worth</h2>
              </div>
              <p className="text-2xl font-bold">₪47,250</p>
              <p className="text-sm text-primary mt-1">+12.4% from last month</p>
            </div>
            
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="font-semibold">Savings Rate</h2>
              </div>
              <p className="text-2xl font-bold">23%</p>
              <p className="text-sm text-muted-foreground mt-1">₪3,450 saved this month</p>
            </div>
            
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-violet-500" />
                </div>
                <h2 className="font-semibold">Budget Overview</h2>
              </div>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </div>
          </div>

          {/* Profile sections */}
          <div className="space-y-4">
            {/* Financial Goals */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Financial Goals</h3>
              </div>
              {profile?.financialGoals ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Primary Goal</span>
                    <span className="font-medium capitalize">{profile.financialGoals.primaryGoal.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Horizon</span>
                    <span className="font-medium capitalize">{profile.financialGoals.timeHorizon.replace(/-/g, ' ')}</span>
                  </div>
                  {profile.financialGoals.priorities.length > 0 && (
                    <div className="pt-2">
                      <span className="text-muted-foreground">Priorities:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.financialGoals.priorities.map((p, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize"
                          >
                            {p.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Complete the questionnaire to add your goals</p>
              )}
            </div>

            {/* Financial Situation */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Financial Situation</h3>
              </div>
              {profile?.financialSituation ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Income</span>
                    <span className="font-medium capitalize">{profile.financialSituation.monthlyIncome.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Expenses</span>
                    <span className="font-medium capitalize">{profile.financialSituation.monthlyExpenses.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Savings</span>
                    <span className="font-medium capitalize">{profile.financialSituation.currentSavings.replace(/-/g, ' ')}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Complete the questionnaire to add your info</p>
              )}
            </div>

            {/* Knowledge Level */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-5 h-5 text-violet-500" />
                <h3 className="font-semibold">Knowledge Level</h3>
              </div>
              {profile?.knowledgeLevel ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Experience</span>
                    <span className="font-medium">{getKnowledgeLabel(profile.knowledgeLevel.investmentExperience)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Tolerance</span>
                    <span className="font-medium capitalize">{profile.knowledgeLevel.riskTolerance}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Complete the questionnaire to set your level</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
