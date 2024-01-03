import {
  format,
  formatDistance,
  formatDistanceToNow,
  addMinutes,
  roundToNearestMinutes,
  formatDistanceStrict,
  addYears,
} from 'date-fns'
import { BATCH_TIME, BATCH_TIME_IN_MS, BATCH_SUBMISSION_CLOSE_TIME } from 'const'

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

/**
 * Calculates the batchId. Either current batchId based on current Epoch
 * or calculated if given a date
 *
 * Keep in mind this is used mainly for generating test data.
 * The contract's `getBatchId` should be the source of truth.
 *
 * @param date? Optional Date object to calculate the batchId from.
 *  Defaults to Date.now()
 */
export function dateToBatchId(date?: Date | string | number | null): number {
  const timestamp = simpleIsDateCheck(date)
  const timestampInSeconds = Math.floor(timestamp / 1000)
  return Math.floor(timestampInSeconds / BATCH_TIME)
}

export function batchIdToDate(batchId: number): Date {
  const timestamp = batchId * BATCH_TIME_IN_MS
  return new Date(timestamp)
}

export const formatRelativeBatchId = (
  newBatchId: string | number,
  baseBatchId: string | number,
  strict?: boolean,
): string => {
  const newDate = batchIdToDate(+newBatchId)
  const baseDate = batchIdToDate(+baseBatchId)

  return strict ? formatDistanceStrict(newDate, baseDate) : formatDistance(newDate, baseDate)
}

export function formatDateFromBatchId(batchId: number, options?: { strict?: boolean; addSuffix?: boolean }): string {
  const { strict = false, addSuffix = true } = options || {}
  const date = batchIdToDate(batchId)
  return strict ? formatDistanceStrict(date, new Date(), { addSuffix }) : formatDistanceToNow(date, { addSuffix })
}

export function formatDateLocaleShortTime(dateMs: number): string {
  const localeDate = new Date(dateMs).toLocaleDateString()
  const time = format(dateMs, 'HH:mm')

  return localeDate + ' ' + time
}

/**
 * Calculates the time when given batch is settled == no longer accepting solutions
 *
 * @param batchId Id of batch we want to get the settling date for
 */
export function calculateSettlingTimestamp(batchId: number): number {
  const batchStart = batchIdToDate(batchId)
  return addMinutes(batchStart, BATCH_SUBMISSION_CLOSE_TIME).getTime()
}

/**
 * Calculates time remaining in current batch.
 * Assumes local time is accurate and can be used as source of truth.
 * By default returns time in seconds.
 *
 * @param inMilliseconds  Optional parameter indicating time unit. Defaults to false == in seconds
 */
export function getTimeRemainingInBatch(params?: { batches?: number; inMilliseconds?: boolean }): number {
  const { inMilliseconds = false, batches = 1 } = params || {}
  const calculatedBatchTimeMs = BATCH_TIME_IN_MS * batches
  const timeRemainingInMs = calculatedBatchTimeMs - (Date.now() % BATCH_TIME_IN_MS)

  return inMilliseconds ? timeRemainingInMs : Math.floor(timeRemainingInMs / 1000)
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
