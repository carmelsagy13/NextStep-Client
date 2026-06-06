import { useEffect, useState } from 'react';
import {
  Building2,
  Link2,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { connectBankApi } from '../api/openfinance.api';
import { useRoadmapStore } from '../store/roadmapStore';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface Props {
  onSuccess?: () => void;
}

/**
 * Loading phases shown while the bank sync request is in flight.
 * `startAt` is the elapsed time (ms) at which the phase becomes active.
 * `progress` is the target progress-bar value (0-100) for that phase.
 * The last phase has no end — it stays until the API resolves.
 */
const LOADING_PHASES = [
  { startAt: 0,      progress: 15, label: 'מתחבר ל-Open Finance...' },
  { startAt: 3_000,  progress: 40, label: 'יוצר חיבור מאובטח...' },
  { startAt: 7_000,  progress: 70, label: 'מאחזר תנועות פיננסיות...' },
  { startAt: 15_000, progress: 92, label: 'מנתח נתונים עם AI (Gemini/Groq)...' },
] as const;

export default function BankSyncConnect({ onSuccess }: Props) {
  const [externalUserId, setExternalUserId] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [phaseIndex, setPhaseIndex] = useState(0);

  const setFromUpload = useRoadmapStore((s) => s.setFromUpload);

  const trimmedId = externalUserId.trim();
  const canSubmit = trimmedId.length > 0 && status !== 'loading';

  // Cycle through loading phases while status === 'loading'.
  // Timers are scheduled relative to the moment loading starts, and are
  // cleared automatically when status changes (success/error/unmount).
  useEffect(() => {
    if (status !== 'loading') return;

    setPhaseIndex(0);
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < LOADING_PHASES.length; i++) {
      const t = setTimeout(() => setPhaseIndex(i), LOADING_PHASES[i].startAt);
      timeouts.push(t);
    }
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [status]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const { data } = await connectBankApi(trimmedId);
      console.log('[BankSyncConnect] analysis response:', data);
      // Reuse the same store hydrator as the file-upload flow — the store
      // is intentionally source-agnostic (file vs API).
      setFromUpload(data);
      setStatus('success');
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMsg(
        error.response?.data?.message ??
          error.message ??
          'Sync failed. Please check your credentials.',
      );
      setStatus('error');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-5 font-sans">
      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          Direct Bank Sync
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Connect your bank via Open Finance and we&apos;ll fetch your latest
          financial data automatically.
        </p>
      </div>

      {/* ── Input ── */}
      <div className="space-y-2">
        <label
          htmlFor="bank-user-id"
          className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400"
        >
          Bank User ID
        </label>
        <div className="relative">
          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="bank-user-id"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="e.g. user_a1b2c3d4"
            value={externalUserId}
            onChange={(e) => setExternalUserId(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={status === 'loading'}
            className="w-full rounded-sm border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 transition
              focus:border-black focus:outline-none focus:ring-1 focus:ring-black
              disabled:cursor-not-allowed disabled:opacity-60
              dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500
              dark:focus:border-white dark:focus:ring-white"
          />
        </div>
      </div>

      {/* ── Submit Button ── */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 rounded-sm bg-black px-5 py-3 text-sm font-semibold text-white transition-all
          hover:bg-gray-900 active:scale-[0.98]
          disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-black
          dark:bg-white dark:text-black dark:hover:bg-gray-100 dark:disabled:hover:bg-white"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Syncing with Bank…
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            Synchronize Bank Data
          </>
        )}
      </button>

      {/* ── Loading hint with phase + progress bar ── */}
      {status === 'loading' && (
        <div
          className="space-y-2.5 rounded-sm border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50"
          dir="rtl"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600" />
            <p
              key={phaseIndex}
              className="text-sm font-medium text-gray-700 transition-opacity dark:text-gray-200"
            >
              {LOADING_PHASES[phaseIndex].label}
            </p>
          </div>

          {/* Slim progress bar */}
          <div
            className="h-1 w-full overflow-hidden rounded-sm bg-gray-200 dark:bg-gray-700"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={LOADING_PHASES[phaseIndex].progress}
          >
            <div
              className="h-full rounded-sm bg-blue-600 transition-all duration-700 ease-out"
              style={{ width: `${LOADING_PHASES[phaseIndex].progress}%` }}
            />
          </div>

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            התהליך עשוי להימשך עד דקה. נא לא לסגור את החלון.
          </p>
        </div>
      )}

      {/* ── Error State ── */}
      {status === 'error' && errorMsg && (
        <div className="flex items-start gap-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">{errorMsg}</p>
        </div>
      )}

      {/* ── Success Banner ── */}
      {status === 'success' && (
        <div className="flex items-center gap-3 rounded-sm border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-800/50">
          <CheckCircle className="h-5 w-5 shrink-0 text-black dark:text-white" />
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Sync successful — your roadmap is ready below.
          </p>
        </div>
      )}
    </div>
  );
}
