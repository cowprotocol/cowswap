/** `HH:mm` in `timeZone` followed by its city, e.g. `15:00 Lisbon` */
export function formatRefTime(updatedAt: string, timeZone: string): string | null {
  const date = new Date(updatedAt)

  if (Number.isNaN(date.getTime())) return null

  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(date)
  const city = (timeZone.split('/').pop() ?? timeZone).replace(/_/g, ' ')

  return `${time} ${city}`
}
