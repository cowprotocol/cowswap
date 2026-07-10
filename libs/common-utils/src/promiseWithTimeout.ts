type PromiseWithTimeoutHandler<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: unknown) => void,
) => void

type PromiseWithTimeoutType = {
  <T>(timeoutMs: number, handler: PromiseWithTimeoutHandler<T>): Promise<T>
  new <T>(timeoutMs: number, handler: PromiseWithTimeoutHandler<T>): Promise<T>
}

/**
 * Returns a Promise that runs the given handler with a timeout. If the handler
 * does not call resolve/reject before the timeout, the promise rejects.
 *
 * Usage: await new PromiseWithTimeout(ms, (resolve, reject) => { ... })
 * or:    await PromiseWithTimeout(ms, (resolve, reject) => { ... })
 */
const promiseWithTimeoutImpl = function PromiseWithTimeout<T>(
  timeoutMs: number,
  handler: PromiseWithTimeoutHandler<T>,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Promise timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    const wrapResolve = (value: T | PromiseLike<T>): void => {
      clearTimeout(timeoutId)
      resolve(value)
    }
    const wrapReject = (reason?: unknown): void => {
      clearTimeout(timeoutId)
      reject(reason)
    }

    try {
      handler(wrapResolve, wrapReject)
    } catch (e) {
      wrapReject(e)
    }
  })
}

export const PromiseWithTimeout = promiseWithTimeoutImpl as PromiseWithTimeoutType
