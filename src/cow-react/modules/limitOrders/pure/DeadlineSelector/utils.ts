import { MAX_CUSTOM_DEADLINE, MIN_CUSTOM_DEADLINE } from '@cow/modules/limitOrders/pure/DeadlineSelector/deadlines'

export function limitDateString(date: Date | number): string {
  const _date = typeof date === 'number' ? new Date(date * 1000) : date

  const [first, second] = _date.toISOString().split(':')

  return [first, second].join(':')
}

const LOCAL_DATE_FORMATTER = new Intl.DateTimeFormat(
  'en-CA', // using CA because the format is yyyy-mm-dd, which is what we need
  {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
)

/**
 * Formats a date object into a Timezone aware string in the format: `yyyy-mm-ddTHH:MM`
 *
 * The important part is the timezone awareness.
 * The `datetime-local` input can't deal with timezones while all Date objs are tz aware.
 * When passing the initial value to the input, using the ISO string representation of the date
 * causes it to be in a different time from user's
 */
export function formatDateToLocalTime(date: Date | number): string {
  const _date = typeof date === 'number' ? new Date(date * 1000) : date

  return LOCAL_DATE_FORMATTER.format(_date) // this returns `2017-06-01, 08:30`
    .replace(/, /, 'T') // we want `2017-06-01T08:30`
}

export function calculateMinMax(): [Date, Date] {
  const now = Date.now()
  return [_trimSeconds(new Date(now + MIN_CUSTOM_DEADLINE)), _trimSeconds(new Date(now + MAX_CUSTOM_DEADLINE))]
}

function _trimSeconds(date: Date): Date {
  return new Date(new Date(date.setMilliseconds(0)).setSeconds(0))
}

/**
 * Gets the datetime-local input initial value based on current stored value and min allowed
 *
 * If a value was previously saved, but it's older than min, use min instead
 */
export function getInputStartDate(customDeadline: number | null, minDate: Date): Date {
  if (customDeadline) {
    const customDate = new Date(customDeadline * 1000)

    if (customDate > minDate) {
      return customDate
    }
  }
  return minDate
}

/**
 * Get client side timezone offset
 *
 * @returns {(+|-)HH:mm} - Where `HH` is 2 digits hours and `mm` 2 digits minutes.
 *
 * From https://stackoverflow.com/a/30377368/1272513 on 2023/01/31
 */
export function getTimeZoneOffset() {
  const timezoneOffset = new Date().getTimezoneOffset()
  const offset = Math.abs(timezoneOffset)
  const offsetOperator = timezoneOffset < 0 ? '+' : '-'
  const offsetHours = Math.floor(offset / 60)
    .toString()
    .padStart(2, '0')
  const offsetMinutes = Math.floor(offset % 60)
    .toString()
    .padStart(2, '0')

  return `${offsetOperator}${offsetHours}:${offsetMinutes}`
}
