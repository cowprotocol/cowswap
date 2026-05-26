export function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    day: 'numeric', // numeric, 2-digit
    year: 'numeric', // numeric, 2-digit
    month: 'short', // numeric, 2-digit, long, short, narrow
    hour: 'numeric', // numeric, 2-digit
    minute: 'numeric', // numeric, 2-digit
    // ArticlePageComponent hydration and formatDate tests rely on UTC to keep server/client strings identical.
    timeZone: 'UTC',
  })
}
