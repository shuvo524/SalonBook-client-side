// Date formatting without `Date` objects in render paths: the API sends
// `YYYY-MM-DD` dates and ISO timestamps, both formatted here by slicing
// the string, which keeps prerendering deterministic.

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2026-11-20" -> "Nov 20, 2026". Returns the input unchanged if it is not a date. */
export function formatDate(dateString: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString);
  if (!match) return dateString;
  const [, year, month, day] = match;
  const monthName = MONTHS[Number(month) - 1];
  if (!monthName) return dateString;
  return `${monthName} ${Number(day)}, ${year}`;
}

/** "2026-11-20T08:38:58.925Z" -> "Nov 20, 2026". */
export function formatDateTime(isoString: string): string {
  return formatDate(isoString.slice(0, 10));
}

/** Today's date as `YYYY-MM-DD` in local time (for the booking date picker). */
export function todayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
