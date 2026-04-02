/**
 * date-utils.ts — Date Helpers for E2E Tests
 *
 * Shared utility for working with payment dates in Playwright tests.
 * BNPL installment dates depend on "today" — these helpers make assertions
 * predictable regardless of when the tests run.
 */

/**
 * Returns a date string for N months from today.
 * Used to verify payment timeline dates.
 *
 * @example
 * monthsFromNow(1) // "May 2026" (if today is April 2026)
 */
export function monthsFromNow(n: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + n);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Returns "Today" or a formatted date for installment assertions.
 * First installment should always show "Today".
 */
export function installmentLabel(index: number): string {
  if (index === 0) return 'Today';
  return monthsFromNow(index);
}

/**
 * Checks if a date string is approximately N months from today.
 * Allows ±3 days tolerance for test reliability.
 */
export function isApproxMonthsFromNow(dateStr: string, n: number): boolean {
  const target = new Date();
  target.setMonth(target.getMonth() + n);

  const parsed = new Date(dateStr);
  const diffMs = Math.abs(parsed.getTime() - target.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays <= 3;
}
