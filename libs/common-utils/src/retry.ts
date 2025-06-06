import { Command } from '@cowprotocol/types'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function waitRandom(min: number, max: number): Promise<void> {
  return wait(min + Math.round(Math.random() * Math.max(0, max - min)))
}

/**
 * This error is thrown if the function is cancelled before completing
 */
export class CancelledError extends Error {
  public isCancelledError = true

  constructor() {
    super('Cancelled')
  }
}

/**
 * Throw this error if the function should retry
 */
export class RetryableError extends Error {
  public isRetryableError = true
}

export interface RetryOptions {
  n: number
  minWait: number
  maxWait: number
}

/**
 * Retries the function that returns the promise until the promise successfully resolves up to n retries
 * @param fn function to retry
 * @param n how many times to retry
 * @param minWait min wait between retries in ms
 * @param maxWait max wait between retries in ms
 */
export function retry<T>(
  fn: () => Promise<T>,
  { n, minWait, maxWait }: RetryOptions,
): { promise: Promise<T>; cancel: Command } {
  let completed = false
  let rejectCancelled: (error: Error) => void
  // eslint-disable-next-line no-async-promise-executor
  const promise = new Promise<T>(async (resolve, reject) => {
    rejectCancelled = reject
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let result: T
      try {
        result = await fn()
        if (!completed) {
          resolve(result)
          completed = true
        }
        break
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (completed) {
          break
        }
        if (n <= 0 || !error.isRetryableError) {
          reject(error)
          completed = true
          break
        }
        n--
      }
      await waitRandom(minWait, maxWait)
    }
  })
  return {
    promise,
    cancel: () => {
      if (completed) return
      completed = true
      rejectCancelled(new CancelledError())
    },
  }
}
