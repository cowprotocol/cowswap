/**
 * Given a Date obj, remove hours, minutes and seconds, and return the timestamp of it
 * @param date
 */
import { BigNumber } from '@ethersproject/bignumber'

export function getDateTimestamp(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/**
 * Helper function that returns a given Date/timestamp as a locale representation of it as string
 * in the format <local date string> (<time zone information>)
 */
export function formatDateWithTimezone(value: Date | number | undefined | null): string | undefined {
  if (!value) {
    return
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return
  }

  return `${date.toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`
}

export function formatShortDate(value: Date | number | string | undefined | null): string | undefined {
  if (!value) {
    return
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })
}

export function timeSinceInSeconds(timestamp?: number): number | undefined {
  if (!timestamp) {
    return
  }
  const timeDelta = Date.now() - timestamp

  return Math.floor(timeDelta / 1000)
}

export const MAX_VALID_TO_EPOCH = BigNumber.from('0xFFFFFFFF').toNumber() // Max uint32 (Feb 07 2106 07:28:15 GMT+0100)
