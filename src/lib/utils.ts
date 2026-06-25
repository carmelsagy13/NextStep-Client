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

