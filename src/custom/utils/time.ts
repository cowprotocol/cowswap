/**
 * Given a Date obj, remove hours, minutes and seconds, and return the timestamp of it
 * @param date
 */
export function getDateTimestamp(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}
