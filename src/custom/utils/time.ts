/**
 * Given a Date obj, remove hours, minutes and seconds, and return the timestamp of it
 * @param date
 */
export function getDateTimestamp(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/**
 * Helper function that returns a given Date/timestamp as a locale representation of it as string
 * in the format <local date string> (<time zone information>)
 */
export function formatDateWithTimezone(date: Date | number | undefined | null): string | undefined {
  if (!date) {
    return
  }
  const _date = date instanceof Date ? date : new Date(date)

  return `${_date.toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`
}
