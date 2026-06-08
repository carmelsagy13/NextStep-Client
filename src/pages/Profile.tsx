import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppNavbar from "@/components/app/AppNavbar";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, getProfileHistory } from "@/api/profile.api";
import type { UserProfileHistory } from "@/types";
import {
  Mail,
  TrendingUp,
  PieChart,
  GraduationCap,
  Target,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackendProfile {
  currentStep?: number;
  riskTolerance?: string;
  knowledgeLevel?: string;
  occupation?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<BackendProfile | null>(null);
  const [history, setHistory] = useState<UserProfileHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        const [profileRes, historyRes] = await Promise.all([
          getProfile(),
          getProfileHistory(),
        ]);
        setProfile(profileRes.data);
        setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      } catch {
        // Profile may not exist yet
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const latestHistory = history[0] ?? null;

  const stepLabels: Record<number, string> = {
    1: "Financial Stability",
    2: "Emergency Fund",
    3: "Debt Freedom",
    4: "Invest & Grow",
    5: "Wealth Building",
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
                  {user?.name?.charAt(0) ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "U"}
                </span>
              </div>
              <div>
                {user?.name && (
                  <h2 className="font-display text-xl font-bold">
                    {user.name}
                  </h2>
                )}
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email || "No email"}
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Current roadmap stage */}
              {profile?.currentStep ? (
                <div className="glass-card p-5 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-semibold">Current Stage</h2>
                  </div>
                  <p className="text-2xl font-bold">
                    Stage {profile.currentStep}
                  </p>
                  <p className="text-sm text-primary mt-1">
                    {stepLabels[profile.currentStep] ?? "In progress"}
                  </p>
                  {latestHistory?.progressPercent != null && (
                    <div className="mt-3">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${latestHistory.progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {latestHistory.progressPercent}% complete
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-card p-5 mb-4 text-center">
                  <p className="text-muted-foreground text-sm mb-3">
                    Complete your financial assessment to see your roadmap
                    stage.
                  </p>
                  <Link to="/roadmap">
                    <Button size="sm" variant="outline">
                      Go to Roadmap
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}

              {/* Latest assessment snapshot */}
              {latestHistory && (
                <div className="glass-card p-5 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <PieChart className="w-5 h-5 text-blue-500" />
                    </div>
                    <h2 className="font-semibold">Latest Assessment</h2>
                  </div>
                  {latestHistory.stateDescription && (
                    <p className="text-sm text-muted-foreground">
                      {latestHistory.stateDescription}
                    </p>
                  )}
                  {latestHistory.stepChanged &&
                    latestHistory.previousStep != null && (
                      <p className="text-xs text-primary mt-2 font-medium">
                        ↑ Advanced from Stage {latestHistory.previousStep} to
                        Stage {latestHistory.step}
                      </p>
                    )}
                  {latestHistory.progressDelta != null &&
                    latestHistory.progressDelta > 0 && (
                      <p className="text-xs text-primary mt-1 font-medium">
                        +{latestHistory.progressDelta}% progress since last
                        check
                      </p>
                    )}
                </div>
              )}

              {/* Profile details */}
              <div className="space-y-4">
                {/* Knowledge & Risk */}
                {(profile?.riskTolerance || profile?.knowledgeLevel) && (
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-5 h-5 text-violet-500" />
                      <h3 className="font-semibold">
                        Knowledge & Risk Profile
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      {profile.knowledgeLevel && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Knowledge Level
                          </span>
                          <span className="font-medium capitalize">
                            {profile.knowledgeLevel}
                          </span>
                        </div>
                      )}
                      {profile.riskTolerance && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Risk Tolerance
                          </span>
                          <span className="font-medium capitalize">
                            {profile.riskTolerance}
                          </span>
                        </div>
                      )}
                      {profile.occupation && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Occupation
                          </span>
                          <span className="font-medium">
                            {profile.occupation}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Retake questionnaire */}
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Update Your Profile</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your financial situation changed? Update your assessment to
                    get a fresh roadmap.
                  </p>
                  <Link to="/questionnaire">
                    <Button variant="outline" size="sm">
                      Retake Questionnaire
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
