import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { MarketingGoalMeta, UserGoal } from "../types";

/** Neutral accent used when a partner has no brand colour configured. */
const FALLBACK_ACCENT = "#111827";

/** Appends an alpha channel to a #RGB/#RRGGBB colour, for tints and borders. */
function withAlpha(hex: string, alpha: string): string {
  const normalized =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  return /^#[0-9a-f]{6}$/i.test(normalized) ? `${normalized}${alpha}` : normalized;
}

/**
 * Opens a sponsored link. Kept as a single choke point so click attribution can
 * be added later without touching the markup.
 */
function handleCtaClick(marketing: MarketingGoalMeta) {
  window.open(marketing.ctaUrl, "_blank", "noopener,noreferrer");
}

function PartnerLogo({ marketing }: { marketing: MarketingGoalMeta }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold text-white"
        style={{ backgroundColor: marketing.brandColor ?? FALLBACK_ACCENT }}
        aria-hidden="true"
      >
        {marketing.partnerName.trim().charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={marketing.partnerLogoUrl}
      alt={marketing.partnerName}
      onError={() => setFailed(true)}
      className="h-12 w-auto max-w-[132px] rounded-xl object-contain"
    />
  );
}

/**
 * Sponsored goal card. Visually separated from advice tasks and intentionally
 * without a checkbox or progress bar — a partner product is acted on, not
 * tracked to a target amount.
 */
export default function MarketingGoalCard({
  goal,
  marketing,
}: {
  goal: UserGoal;
  marketing: MarketingGoalMeta;
}) {
  const accent = marketing.brandColor ?? FALLBACK_ACCENT;

  return (
    <div
      dir="rtl"
      className="relative overflow-hidden rounded-lg border px-4 pb-4 pt-5 shadow-sm"
      style={{
        borderColor: withAlpha(accent, "59"),
        backgroundImage: `linear-gradient(160deg, ${withAlpha(accent, "1f")} 0%, ${withAlpha(accent, "08")} 45%, transparent 100%)`,
      }}
    >
      {/* Accent rail marking the card as sponsored at a glance. */}
      <span
        aria-hidden
        className="absolute inset-y-0 end-0 w-1"
        style={{ backgroundColor: accent }}
      />

      <div className="min-w-0">
        <PartnerLogo marketing={marketing} />

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-sm px-2 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            {marketing.partnerName}
          </span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
            תוכן שיווקי
          </span>
        </div>

        <p className="mt-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100">
          {marketing.headline}
        </p>

        {marketing.subheadline && (
          <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            {marketing.subheadline}
          </p>
        )}

        {goal.aiInsight && (
          <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            {goal.aiInsight}
          </p>
        )}

        {marketing.benefitTags.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {marketing.benefitTags.map((tag) => (
              <li
                key={tag}
                className="rounded-sm border bg-white/70 px-1.5 py-0.5 text-[10px] text-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
                style={{ borderColor: withAlpha(accent, "4d") }}
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => handleCtaClick(marketing)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95"
          style={{ backgroundColor: accent }}
        >
          {marketing.ctaLabel}
          <ExternalLink className="h-3.5 w-3.5" />
        </button>

        <p className="mt-2 text-[10px] leading-relaxed text-gray-400 dark:text-gray-500">
          {marketing.disclaimer}
        </p>
      </div>
    </div>
  );
}
