import 'server-only'

const FIRST_RETRY_DELAY_MS = 60_000
const MAX_RETRY_DELAY_MS = 60 * 60_000

interface FailureState {
  failures: number
  retryAt: number
}

/** Per server instance: the data cache keeps no state for failed requests */
const failuresByKey = new Map<string, FailureState>()

export class RetryBackoffError extends Error {
  constructor(key: string, retryAt: number) {
    super(`${key} failed, next retry at ${new Date(retryAt).toISOString()}`)
    this.name = 'RetryBackoffError'
  }
}

/** 60s after the 1st failure, doubled after each next one, up to an hour */
export function getRetryDelayMs(failures: number): number {
  return Math.min(FIRST_RETRY_DELAY_MS * 2 ** (failures - 1), MAX_RETRY_DELAY_MS)
}

/**
 * Runs `load` unless `key` failed recently, then throws `RetryBackoffError` without calling it.
 * A success resets the delay
 */
export async function withRetryBackoff<T>(key: string, load: () => Promise<T>): Promise<T> {
  const state = failuresByKey.get(key)

  if (state && Date.now() < state.retryAt) throw new RetryBackoffError(key, state.retryAt)

  try {
    const result = await load()

    failuresByKey.delete(key)

    return result
  } catch (err: unknown) {
    const failures = (state?.failures ?? 0) + 1

    failuresByKey.set(key, { failures, retryAt: Date.now() + getRetryDelayMs(failures) })

    throw err
  }
}
