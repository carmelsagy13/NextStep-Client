import { useState } from "react";
import { Link2, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { connectBankApi } from "../api/openfinance.api";
import { useRoadmapStore } from "../store/roadmapStore";
import AnalysisLoadingIndicator from "./AnalysisLoadingIndicator";

type Status = "idle" | "loading" | "consent" | "success" | "error";

interface Props {
  onSuccess?: () => void;
}

export default function BankSyncConnect({ onSuccess }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [consentUrl, setConsentUrl] = useState<string>("");

  const setFromUpload = useRoadmapStore((s) => s.setFromUpload);

  const canSubmit = status !== "loading";

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const { data } = await connectBankApi();
      console.log("[BankSyncConnect] connect-api response:", data);

      if (data.stage === "CONNECTION_REQUIRED") {
        setConsentUrl(data.connectionUrl);
        setStatus("consent");
        // Open the bank consent page in a new tab
        window.open(data.connectionUrl, "_blank", "noopener,noreferrer");
        return;
      }

      // stage === 'ANALYSIS_COMPLETE'
      setFromUpload(data.analysis);
      setStatus("success");
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setErrorMsg(
        error.response?.data?.message ??
          error.message ??
          "הסנכרון נכשל. אנא בדוק את הפרטים שלך.",
      );
      setStatus("error");
    }
  };

  /** Called after the user completes the bank consent flow. Re-calls connect-api
   *  which should now return ANALYSIS_COMPLETE. */
  const handlePostConsent = async () => {
    setStatus("loading");
    setErrorMsg("");

    try {
      const { data } = await connectBankApi();
      console.log("[BankSyncConnect] post-consent response:", data);

      if (data.stage === "CONNECTION_REQUIRED") {
        // Still needs consent — re-show the consent banner
        setConsentUrl(data.connectionUrl);
        setStatus("consent");
        return;
      }

      setFromUpload(data.analysis);
      setStatus("success");
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setErrorMsg(
        error.response?.data?.message ??
          error.message ??
          "הסנכרון נכשל. אנא נסה שנית.",
      );
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-5 font-sans" dir="rtl">
      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          סנכרון ישיר עם הבנק
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          חבר את הבנק שלך דרך Open Finance ונביא אוטומטית את הנתונים הפיננסיים
          העדכניים שלך.
        </p>
      </div>

      {/* ── Submit Button ── */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all
          hover:bg-primary/90 active:scale-[0.98]
          disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            מסנכרן עם הבנק...
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            סנכרן נתוני בנק
          </>
        )}
      </button>

      {/* ── Loading hint with phase + progress bar ── */}
      {status === "loading" && (
        <AnalysisLoadingIndicator active={status === "loading"} />
      )}

      {/* ── Consent Flow Banner ── */}
      {status === "consent" && (
        <div className="space-y-3 rounded-sm border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30">
          <div className="flex items-start gap-3">
            <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                נדרש אישור בנקאי
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                נפתחה לשונית חדשה לאישור גישה לנתוני הבנק. לאחר השלמת האישור,
                לחץ על הכפתור למטה להמשיך.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePostConsent}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all
                hover:bg-primary/90 active:scale-[0.98]"
            >
              <CheckCircle className="h-4 w-4" />
              השלמתי את האישור
            </button>
            <a
              href={consentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              פתח מחדש את דף האישור
            </a>
          </div>
        </div>
      )}

      {/* ── Error State ── */}
      {status === "error" && errorMsg && (
        <div className="flex items-start gap-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">{errorMsg}</p>
        </div>
      )}

      {/* ── Success Banner ── */}
      {status === "success" && (
        <div className="flex items-center gap-3 rounded-sm border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-800/50">
          <CheckCircle className="h-5 w-5 shrink-0 text-black dark:text-white" />
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            הסנכרון הצליח — המפה שלך מוכנה למטה.
          </p>
        </div>
      )}
    </div>
  );
}
