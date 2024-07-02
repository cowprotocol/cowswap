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
export function formatDateWithTimezone(date: Date | number | undefined | null): string | undefined {
  if (!date) {
    return
  }
  const _date = date instanceof Date ? date : new Date(date)

  return `${_date.toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`
}

export function timeSinceInSeconds(timestamp?: number): number | undefined {
  if (!timestamp) {
    return
  }
  const timeDelta = Date.now() - timestamp

  return Math.floor(timeDelta / 1000)
}

export const MAX_VALID_TO_EPOCH = BigNumber.from('0xFFFFFFFF').toNumber() // Max uint32 (Feb 07 2106 07:28:15 GMT+0100)
