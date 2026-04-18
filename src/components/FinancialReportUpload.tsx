import { useRef, useState } from 'react';
import {
  UploadCloud,
  FileJson,
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { uploadFinancialReport, type AnalysisResult } from '../api/openfinance.api';

type Status = 'idle' | 'ready' | 'loading' | 'success' | 'error';

export default function FinancialReportUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // ── helpers ──────────────────────────────────────────────────────────────

  const selectFile = (f: File) => {
    if (!f.name.endsWith('.json')) {
      setErrorMsg('Only .json files are accepted.');
      setStatus('error');
      return;
    }
    setFile(f);
    setStatus('ready');
    setResult(null);
    setErrorMsg('');
  };

  const clearFile = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── drag-and-drop ─────────────────────────────────────────────────────────

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) selectFile(dropped);
  };

  // ── submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!file) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const { data } = await uploadFinancialReport(file);
      setResult(data);
      setStatus('success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMsg(
        error.response?.data?.message ?? error.message ?? 'Upload failed. Please try again.',
      );
      setStatus('error');
    }
  };

  // ── derived UI state ──────────────────────────────────────────────────────

  const dropzoneBase =
    'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer';
  const dropzoneIdle = isDragging
    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
    : 'border-gray-300 dark:border-gray-600 hover:border-violet-400 hover:bg-gray-50 dark:hover:bg-gray-800/50';
  const dropzoneReady = 'border-violet-500 bg-violet-50 dark:bg-violet-950/20';

  const isDropzoneReady = status === 'ready' || status === 'success';

  return (
    <div className="w-full max-w-lg mx-auto space-y-5 font-sans">
      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          Financial Report Analysis
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload your Open Finance JSON report and receive an AI-powered analysis.
        </p>
      </div>

      {/* ── Drop Zone ── */}
      <div
        className={`${dropzoneBase} ${isDropzoneReady ? dropzoneReady : dropzoneIdle}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        aria-label="Upload JSON file"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) selectFile(f);
          }}
        />

        {!file ? (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
              <UploadCloud className="h-7 w-7 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drag &amp; drop your file here, or{' '}
                <span className="text-violet-600 dark:text-violet-400 underline underline-offset-2">
                  browse
                </span>
              </p>
              <p className="mt-1 text-xs text-gray-400">Accepts .json files only</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
              <FileJson className="h-7 w-7 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 break-all">
                {file.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>

            {/* Clear button — stops propagation so it doesn't re-open the picker */}
            <button
              type="button"
              aria-label="Remove file"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="absolute top-3 right-3 rounded-full p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* ── Submit Button ── */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || status === 'loading'}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all
          hover:bg-violet-700 active:scale-[0.98]
          disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-violet-600"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analysing…
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4" />
            Submit Analysis
          </>
        )}
      </button>

      {/* ── Error State ── */}
      {status === 'error' && errorMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">{errorMsg}</p>
        </div>
      )}

      {/* ── Success / Result Card ── */}
      {status === 'success' && result && (
        <div className="rounded-2xl border border-violet-200 bg-white shadow-md dark:border-violet-800 dark:bg-gray-900 overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-3 border-b border-violet-100 dark:border-violet-800/60 bg-violet-50 dark:bg-violet-950/40 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 shadow-sm">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-violet-500 dark:text-violet-400">
                Analysis Complete
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Your financial report has been processed
              </p>
            </div>
          </div>

          {/* Card body */}
          <div className="px-5 py-5 space-y-4">
            {/* Step number */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 shadow-sm min-w-[72px]">
                <span className="text-2xl font-bold text-white leading-none">
                  {result.step_id}
                </span>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-violet-200">
                  Step
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This is your current financial step on the NextStep roadmap.
              </p>
            </div>

            {/* Explanation */}
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 px-4 py-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Explanation
              </p>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {result.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
