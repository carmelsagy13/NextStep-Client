import { useEffect, useMemo, useState } from "react";
import { Lightbulb, ChevronRight, ChevronLeft } from "lucide-react";
import { articles } from "../data/articles";

interface FinancialTipProps {
  /** How often to rotate to the next tip, in milliseconds. */
  rotateMs?: number;
}

/**
 * Shows a short Hebrew financial tip drawn from the data center articles.
 * Meant to keep the user engaged while a slow background task (e.g. the
 * Open Finance sync + AI analysis) is in flight. Tips rotate gently so the
 * user always has something fresh to read during the wait, and the user can
 * also step through them manually.
 */
export default function FinancialTip({ rotateMs = 10000 }: FinancialTipProps) {
  // Build a shuffled list of tips once, so rotation feels random but never
  // repeats a tip until the whole list has been shown.
  const tips = useMemo(() => {
    const list = articles
      .filter((a) => a.excerpt?.trim())
      .map((a) => ({ id: a.id, title: a.title, excerpt: a.excerpt }));
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, []);

  const [index, setIndex] = useState(0);

  // Auto-advance. `index` is a dependency so manually switching a tip resets
  // the 10s timer instead of cutting the current tip short.
  useEffect(() => {
    if (tips.length <= 1) return;
    const id = setTimeout(() => {
      setIndex((prev) => (prev + 1) % tips.length);
    }, rotateMs);
    return () => clearTimeout(id);
  }, [tips.length, rotateMs, index]);

  if (tips.length === 0) return null;

  const goPrev = () =>
    setIndex((prev) => (prev - 1 + tips.length) % tips.length);
  const goNext = () => setIndex((prev) => (prev + 1) % tips.length);

  const tip = tips[index];

  return (
    <div
      className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/20"
      dir="rtl"
    >
      <div className="flex items-start gap-3">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div key={tip.id} className="min-w-0 flex-1 space-y-1 animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            טיפ פיננסי
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {tip.title}
          </p>
          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            {tip.excerpt}
          </p>
        </div>
      </div>

      {/* Manual navigation: only meaningful with more than one tip. */}
      {tips.length > 1 && (
        <div className="mt-2.5 flex items-center justify-between border-t border-amber-200/60 pt-2 dark:border-amber-900/40">
          {/* In RTL, "previous" reads to the right and "next" to the left. */}
          <button
            type="button"
            onClick={goPrev}
            aria-label="הטיפ הקודם"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-100 active:scale-95 dark:text-amber-400 dark:hover:bg-amber-900/30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            הקודם
          </button>

          <span className="text-[11px] tabular-nums text-amber-700/80 dark:text-amber-400/80">
            {index + 1} / {tips.length}
          </span>

          <button
            type="button"
            onClick={goNext}
            aria-label="הטיפ הבא"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-100 active:scale-95 dark:text-amber-400 dark:hover:bg-amber-900/30"
          >
            הבא
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
