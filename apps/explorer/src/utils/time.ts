import { addMinutes, addYears, format, formatDistanceStrict, roundToNearestMinutes } from 'date-fns'

export { formatDistanceStrict, format as formatDate, addMinutes, addYears, roundToNearestMinutes }
export const DEFAULT_DATE_FORMAT = 'yyyy.MM.dd HH:mm'
/**
 * Epoch in seconds
 */
export function getEpoch(): number {
  return Math.floor(Date.now() / 1000)
}

export const simpleIsDateCheck = (date?: Date | string | number | null): number =>
  !date ? Date.now() : typeof date === 'string' || typeof date === 'number' ? +date : date.getTime()

export function formatDateLocaleShortTime(dateMs: number): string {
  const localeDate = new Date(dateMs).toLocaleDateString()
  const time = format(dateMs, 'HH:mm')

  return localeDate + ' ' + time
}

export function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainderSeconds = seconds % 60
  let s = ''

  if (minutes > 0) {
    s += `${minutes}m `
  }
  if (remainderSeconds > 0) {
    s += `${remainderSeconds}s`
  }
  if (minutes === 0 && remainderSeconds === 0) {
    s = '0s'
  }

  return s
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
async function noop(_milliseconds = 0): Promise<void> {}

export async function waitImpl(milliseconds = 2500): Promise<void> {
  return new Promise((resolve): void => {
    setTimeout((): void => {
      resolve()
    }, milliseconds)
  })
}

export const wait = process.env.NODE_ENV === 'test' ? noop : waitImpl
