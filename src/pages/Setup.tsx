import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import AppNavbar from "@/components/app/AppNavbar";
import DataLoadSection from "@/components/DataLoadSection";
import { useAuth } from "@/hooks/useAuth";

/**
 * Shown when the user has no financial data yet (no profile or no goals).
 * Presents the two data-loading methods, runs the LLM, then forwards to /roadmap.
 */
const Setup = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleSuccess = () => {
    navigate("/roadmap");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />

      <main className="flex-1 p-4" dir="rtl">
        <div className="max-w-lg mx-auto space-y-6 pt-6">
          {/* Hero header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">
              טעינת נתונים עבור המשתמש שלך
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              לא נמצאו נתונים פיננסיים עבור החשבון שלך. האם להריץ את ה-LLM עם
              נתוני OpenFinance?
            </p>
          </div>

          {/* Upload / connect panel */}
          <DataLoadSection onSuccess={handleSuccess} />
        </div>
      </main>
    </div>
  );
};

export default Setup;
