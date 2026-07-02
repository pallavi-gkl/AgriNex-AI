import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names, resolving conflicts.
 * Uses clsx for conditional class joining + tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as Indian currency (INR).
 * @example formatCurrency(34250) → "₹34,250"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Generates a unique AgriNex traceability code.
 * Format: ANX-{LOCATION_CODE}-{CROP_CODE}-{RANDOM}
 * @example generateTraceabilityCode("SAT", "POT") → "ANX-SAT-POT-7K3F"
 */
export function generateTraceabilityCode(
  locationCode: string = "XX",
  cropCode: string = "XX"
): string {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ANX-${locationCode.substring(0, 3).toUpperCase()}-${cropCode.substring(0, 3).toUpperCase()}-${random}`;
}

/**
 * Truncates a string to a given length with an ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}…`;
}

/**
 * Returns a relative time string (e.g., "2 hours ago").
 */
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60)  return `${diffSec}s ago`;
  if (diffMin < 60)  return `${diffMin}m ago`;
  if (diffHr < 24)   return `${diffHr}h ago`;
  if (diffDay < 30)  return `${diffDay}d ago`;
  return past.toLocaleDateString("en-IN");
}

/**
 * Status badge color map — consistent across the whole app.
 */
export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending:          "bg-amber-500/20   text-amber-400   border-amber-500/30",
  accepted:         "bg-sky-500/20     text-sky-400     border-sky-500/30",
  quality_verified: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  dispatched:       "bg-indigo-500/20  text-indigo-400  border-indigo-500/30",
  delivered:        "bg-slate-500/20   text-slate-400   border-slate-500/30",
  cancelled:        "bg-red-500/20     text-red-400     border-red-500/30",
};

/** Capitalizes first letter of each word */
export function titleCase(str: string): string {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
