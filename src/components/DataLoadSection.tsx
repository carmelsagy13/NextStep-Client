import FinancialReportUpload from "./FinancialReportUpload";
import BankSyncConnect from "./BankSyncConnect";

interface Props {
  /** Called after either upload method completes successfully. */
  onSuccess: () => void;
  /** Optional heading override (defaults to the standard setup text). */
  title?: string;
  /** Optional subtitle/description override. */
  subtitle?: string;
}

/**
 * Shared data-loading panel used in:
 * - /setup  (new-user onboarding)
 * - /roadmap  (inline refresh panel)
 * - /admin  (force-overwrite panel)
 */
export default function DataLoadSection({ onSuccess, title, subtitle }: Props) {
  return (
    <div className="space-y-6" dir="rtl">
      {(title || subtitle) && (
        <div className="text-center space-y-1">
          {title && <h2 className="font-display text-xl font-bold">{title}</h2>}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      <FinancialReportUpload onSuccess={onSuccess} />

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-border" />
        <span className="px-3 text-xs text-muted-foreground">
          או התחבר ישירות
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      <BankSyncConnect onSuccess={onSuccess} />
    </div>
  );
}
