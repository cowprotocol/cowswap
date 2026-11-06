import { MAX_CUSTOM_DEADLINE, MIN_CUSTOM_DEADLINE } from 'modules/limitOrders/pure/DeadlineSelector/deadlines'

export function calculateMinMax(): [Date, Date] {
  const now = Date.now()
  return [_trimSeconds(new Date(now + MIN_CUSTOM_DEADLINE)), _trimSeconds(new Date(now + MAX_CUSTOM_DEADLINE))]
}

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

  // Because toISOString returns a UTC date, we need to adjust it to the user's timezone.
  const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000
  const adjustedDateForTimezone = new Date(_date.getTime() - timezoneOffset)

  return adjustedDateForTimezone
    .toISOString() // this returns `2017-06-01T08:30Z`
    .replace('Z', '') // we want `2017-06-01T08:30`
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

export function limitDateString(date: Date | number): string {
  const _date = typeof date === 'number' ? new Date(date * 1000) : date

  const [first, second] = _date.toISOString().split(':')

  return [first, second].join(':')
}

function _trimSeconds(date: Date): Date {
  return new Date(new Date(date.setMilliseconds(0)).setSeconds(0))
}
