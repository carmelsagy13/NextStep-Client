import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a whole-number money value with thousands separators (a comma every
 * three digits from the right). e.g. 100000 -> "100,000", 1234567 -> "1,234,567".
 * Returns "" for empty/invalid input.
 */
export function formatThousands(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === "") return "";
  const digits = String(value).replace(/\D/g, "");
  if (digits === "") return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Strip thousands separators (and any non-digits) back to a plain digit string. */
export function parseThousands(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Format a numeric money value as localised currency (Hebrew locale), with no
 * fractional digits. e.g. formatMoney(480) -> "\u200f480 \u20aa". Falls back to a
 * plain "<currency> <amount>" string for unknown currency codes.
 */
export function formatMoney(value: number, currency = "ILS"): string {
  try {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${formatThousands(Math.round(value))}`;
  }
}

