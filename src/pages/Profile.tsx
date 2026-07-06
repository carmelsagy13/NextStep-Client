import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppNavbar from "@/components/app/AppNavbar";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, getProfileHistory } from "@/api/profile.api";
import type { Profile as UserProfileData, UserProfileHistory } from "@/types";
import ProfileGoals from "@/components/ProfileGoals";
import {
  Mail,
  TrendingUp,
  PieChart,
  GraduationCap,
  Target,
  Loader2,
  ArrowRight,
  IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Hebrew labels for the English enum values stored in the DB.
const KNOWLEDGE_LEVEL_LABELS: Record<string, string> = {
  none: "מתחיל/ה לחלוטין",
  basic: "ידע בסיסי",
  intermediate: "בינוני",
  advanced: "מתקדם",
};

const RISK_TOLERANCE_LABELS: Record<string, string> = {
  conservative: "שמרנית",
  moderate: "מתונה",
  aggressive: "מכוונת צמיחה",
};

/** Map a raw enum value to its Hebrew label (case-insensitive), else return as-is. */
const toHebrewLabel = (
  value: string | undefined,
  labels: Record<string, string>,
): string => (value ? (labels[value.toLowerCase()] ?? value) : "");

const Profile = () => {
  const navigate = useNavigate();
  const { userProfile: user, displayId, email, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
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
    1: "יציבות פיננסית",
    2: "קרן חירום",
    3: "חופש מחובות",
    4: "השקע וצמח",
    5: "בניית עושר",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />

      <main className="flex-1 px-6 py-4" dir="rtl">
        <div className="max-w-lg mx-auto">
          <h1 className="font-display text-2xl font-bold mb-6">הפרופיל שלי</h1>

          {/* User info card */}
          <div className="glass-card-elevated p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {user?.name?.charAt(0) ||
                    email?.charAt(0).toUpperCase() ||
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
                  {email || "אין אימייל"}
                </p>
                {displayId && (
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <IdCard className="w-4 h-4" />
                    {displayId}
                  </p>
                )}
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
                    <h2 className="font-semibold">שלב נוכחי</h2>
                  </div>
                  <p className="text-2xl font-bold">
                    שלב {profile.currentStep}
                  </p>
                  <p className="text-sm text-primary mt-1">
                    {stepLabels[profile.currentStep] ?? "בתהליך"}
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
                        {latestHistory.progressPercent}% הושלם
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-card p-5 mb-4 text-center">
                  <p className="text-muted-foreground text-sm mb-3">
                    השלם את ההערכה הפיננסית שלך כדי לראות את שלב המפה.
                  </p>
                  <Link to="/roadmap">
                    <Button size="sm">
                      עבור למפה
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
                    <h2 className="font-semibold">הערכה אחרונה</h2>
                  </div>
                  {latestHistory.stateDescription && (
                    <p className="text-sm text-muted-foreground">
                      {latestHistory.stateDescription}
                    </p>
                  )}
                  {latestHistory.stepChanged &&
                    latestHistory.previousStep != null && (
                      <p className="text-xs text-primary mt-2 font-medium">
                        ↑ התקדמתא משלב {latestHistory.previousStep} לשלב{" "}
                        {latestHistory.step}
                      </p>
                    )}
                  {latestHistory.progressDelta != null &&
                    latestHistory.progressDelta > 0 && (
                      <p className="text-xs text-primary mt-1 font-medium">
                        +{latestHistory.progressDelta}% התקדמות מאז הבדיקה
                        האחרונה
                      </p>
                    )}
                </div>
              )}

              {/* Profile details */}
              <div className="space-y-4">
                {/* Goals */}
                <ProfileGoals />

                {/* Knowledge & Risk */}
                {(profile?.riskTolerance || profile?.knowledgeLevel) && (
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-5 h-5 text-violet-500" />
                      <h3 className="font-semibold">פרופיל ידע וסיכון</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      {profile.knowledgeLevel && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">רמת ידע</span>
                          <span className="font-medium">
                            {toHebrewLabel(
                              profile.knowledgeLevel,
                              KNOWLEDGE_LEVEL_LABELS,
                            )}
                          </span>
                        </div>
                      )}
                      {profile.riskTolerance && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            סובלנות סיכון
                          </span>
                          <span className="font-medium">
                            {toHebrewLabel(
                              profile.riskTolerance,
                              RISK_TOLERANCE_LABELS,
                            )}
                          </span>
                        </div>
                      )}
                      {profile.occupation && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">עיסוק</span>
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
                    <h3 className="font-semibold">עדכן את הפרופיל שלך</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    המצב הכלכלי שלך השתנה? עדכן את ההערכה לקבלת מפת דרכים חדשה.
                  </p>
                  <Link to="/questionnaire">
                    <Button size="sm">
                      מלא שאלון מחדש
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
