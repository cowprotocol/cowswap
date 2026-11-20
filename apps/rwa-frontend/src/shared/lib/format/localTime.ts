export interface LocalTimeParts {
  /** `16` */
  day: string
  /** `Sep` */
  month: string
  /** `2026` */
  year: string
  /** `15:05` */
  time: string
}

/** `14:00`, `timestamp` (ms) in `timeZone`, the user's time zone by default */
export function formatLocalTime(timestamp: number, timeZone?: string): string {
  return getLocalTimeParts(timestamp, timeZone).time
}

/** `timestamp` (ms) in `timeZone`, the user's time zone by default */
export function getLocalTimeParts(timestamp: number, timeZone?: string): LocalTimeParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).formatToParts(timestamp)
  const part = (type: Intl.DateTimeFormatPartTypes): string => parts.find((item) => item.type === type)?.value ?? ''

  return {
    day: part('day'),
    month: part('month'),
    year: part('year'),
    time: `${part('hour')}:${part('minute')}`,
  }
}
