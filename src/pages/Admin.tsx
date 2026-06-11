import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppNavbar from "@/components/app/AppNavbar";
import DataLoadSection from "@/components/DataLoadSection";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useRoadmapStore } from "@/store/roadmapStore";
import { resetAccountData } from "@/api/openfinance.api";

type AdminStep = "confirm" | "resetting" | "load";

/**
 * Admin panel — accessible at /admin by any authenticated user.
 * Wipes the current user's financial data and re-runs the LLM
 * via the standard upload / bank-sync flow.
 */
const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const userId = useAuthStore((s) => s.userId);
  const displayId = useAuthStore((s) => s.displayId);
  const { reset } = useRoadmapStore();

  const [step, setStep] = useState<AdminStep>("confirm");
  const [confirmed, setConfirmed] = useState(false);
  const [resetError, setResetError] = useState("");

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleReset = async () => {
    if (!confirmed) return;
    setStep("resetting");
    setResetError("");
    try {
      await resetAccountData();
      reset(); // clear local store
      setStep("load");
    } catch {
      setResetError("האיפוס נכשל. נסה שוב.");
      setStep("confirm");
    }
  };

  const handleSuccess = () => {
    navigate("/roadmap");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />

      <main className="flex-1 p-4" dir="rtl">
        <div className="max-w-lg mx-auto space-y-6 pt-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              פאנל ניהול — טעינת נתונים
            </h1>
            {(displayId || userId) && (
              <p className="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-3 py-1 inline-block">
                משתמש: {displayId ?? userId}
              </p>
            )}
          </div>

          {/* Step: confirm */}
          {step === "confirm" && (
            <div className="glass-card p-6 space-y-4 border-destructive/20">
              <div className="space-y-2">
                <h2 className="font-semibold text-destructive">אזהרה</h2>
                <p className="text-sm text-muted-foreground">
                  פעולה זו תמחק לצמיתות את כל הנתונים הפיננסיים שלך (מפה, יעדים,
                  היסטוריה) ותריץ מחדש את ה-LLM על הנתונים החדשים שתספק. פרטי
                  החשבון שלך יישמרו.
                </p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-destructive"
                />
                <span className="text-sm">
                  אני מבין/ה שהנתונים יימחקו לצמיתות
                </span>
              </label>

              {resetError && (
                <p className="text-sm text-destructive">{resetError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  disabled={!confirmed}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  אפס והמשך לטעינה
                </Button>
                <Button onClick={() => navigate("/roadmap")}>ביטול</Button>
              </div>
            </div>
          )}

          {/* Step: resetting */}
          {step === "resetting" && (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">מאפס נתונים...</p>
            </div>
          )}

          {/* Step: load new data */}
          {step === "load" && (
            <div className="space-y-4">
              <div className="glass-card p-4 border-primary/20 text-center">
                <p className="text-sm text-muted-foreground">
                  הנתונים אופסו בהצלחה. טען נתונים חדשים להפעלת ה-LLM.
                </p>
              </div>
              <DataLoadSection onSuccess={handleSuccess} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
