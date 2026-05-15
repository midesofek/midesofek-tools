/**
 * Format a USD value for display.
 * Returns "—" for undefined (graceful price-fetch failures).
 * Adapts decimal places to the value's magnitude — tiny fees still readable.
 */
export function formatUsd(value: number | undefined): string {
  if (value === undefined || value === null) return "—";
  if (value === 0) return "$0.00";
  if (value < 0.01) return `$${value.toFixed(4)}`;
  if (value < 1) return `$${value.toFixed(3)}`;
  if (value < 1000) return `$${value.toFixed(2)}`;
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/**
 * Format a token amount with adaptive precision.
 * 10620656.316728 → "10,620,656.317"
 * 0.000005 → "0.000005"
 * 1.105922387 → "1.105922"
 */
export function formatAmount(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  if (num === 0) return "0";
  if (num < 0.0001) return num.toFixed(8).replace(/\.?0+$/, "");
  if (num < 1) return num.toFixed(6).replace(/\.?0+$/, "");
  if (num < 1000) return num.toFixed(4).replace(/\.?0+$/, "");
  return num.toLocaleString("en-US", { maximumFractionDigits: 3 });
}

/**
 * Format a Date as "May 14, 2026 at 3:25 PM UTC".
 * Use UTC for receipts — they should be timezone-independent.
 */
export function formatTimestamp(date: Date): string {
  const dateStr = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
  return `${dateStr} at ${timeStr} UTC`;
}
