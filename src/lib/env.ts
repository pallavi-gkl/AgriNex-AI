/**
 * @fileoverview Centralized environment variable sanitization utility.
 * Strips whitespace, quotes, and newlines/carriage returns from process.env keys.
 */

/**
 * Sanitizes an environment variable value by:
 * 1. Trimming leading/trailing whitespace
 * 2. Removing outer quotes (single, double, or backticks)
 * 3. Removing newline (\n) and carriage return (\r) characters
 */
export function cleanEnvVar(val: string | undefined): string {
  if (!val) return "";
  let cleaned = val.trim();
  
  // Strip double quotes
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  // Strip single quotes
  else if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  // Strip backticks
  else if (cleaned.startsWith("`") && cleaned.endsWith("`")) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  
  return cleaned.trim().replace(/[\r\n]+/g, "");
}
