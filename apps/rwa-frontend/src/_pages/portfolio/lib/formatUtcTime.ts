const utcTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
})

/** `14:00 UTC` */
export function formatUtcTime(timestamp: number): string {
  return `${utcTimeFormatter.format(timestamp)} UTC`
}
