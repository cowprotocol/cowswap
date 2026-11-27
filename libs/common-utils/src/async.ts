// // TODO: If this work our, I will move it to my own library
// This logic is a modified version of:
//    https://github.com/slorber/awesome-only-resolves-last-promise
//    https://github.com/slorber/awesome-imperative-promise
// Main difference, is that cancel resolves the promise with a cancelled flag to true

import { Command } from '@cowprotocol/types'

import { delay } from './misc'

export type CancelableResult<T> = CancelledResult | SuccessResult<T>
export type CancelCallback = Command
export type CancelledResult = {
  cancelled: true
  data: undefined
}

export type ImperativePromise<T> = {
  promise: Promise<CancelableResult<T>>
  resolve: ResolveCallback<T>
  reject: RejectCallback
  cancel: CancelCallback
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RejectCallback = (reason?: any) => void

export type ResolveCallback<T> = (value: CancelableResult<T>) => void

export interface SlowPromiseHandlerOptions {
  /** Fire the slow callback after this many milliseconds if the promise is still pending. */
  maxDuration: number
  /** Optional artificial delay after the promise resolves (testing only). */
  fakeDelay?: number
}

export type SuccessResult<T> = {
  cancelled: false
  data: T
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncFunction<T> = (...args: any[]) => Promise<T>

export function createImperativePromise<T>(promiseArg?: Promise<T> | null | undefined): ImperativePromise<T> {
  let resolve: ResolveCallback<T> | null = null
  let reject: RejectCallback | null = null

  const wrappedPromise = new Promise<CancelableResult<T>>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  promiseArg &&
    promiseArg.then(
      (data) => {
        resolve &&
          resolve({
            cancelled: false,
            data,
          })
      },
      (error) => {
        reject && reject(error)
      },
    )

  return {
    promise: wrappedPromise,
    resolve: ({ cancelled, data }) => {
      if (resolve) {
        if (cancelled) {
          resolve({ cancelled, data: undefined })
        } else {
          resolve({ cancelled, data: data as T })
        }
      }
    },
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reject: (reason?: any) => {
      reject && reject(reason)
    },
    cancel: () => {
      resolve && resolve({ cancelled: true, data: undefined })
    },
  }
}

// see https://stackoverflow.com/a/54825370/82609
export function onlyResolvesLast<R>(
  asyncFunction: AsyncFunction<R>,
): (...args: ArgumentsType<AsyncFunction<R>>) => Promise<CancelableResult<R>> {
  let cancelPrevious: CancelCallback | null = null

  return (...args: ArgumentsType<AsyncFunction<R>>) => {
    cancelPrevious && cancelPrevious()
    const initialPromise = asyncFunction(...args)
    const { promise, cancel } = createImperativePromise(initialPromise)
    cancelPrevious = cancel
    return promise
  }
}

/**
 * Awaits a promise and invokes `onSlow` once `maxDuration` elapses while it is still pending.
 * The slow callback is skipped if the promise settles first.
 */
export async function slowPromiseHandler<T>(
  promise: Promise<T>,
  onSlow: () => void,
  { maxDuration, fakeDelay = 0 }: SlowPromiseHandlerOptions,
): Promise<T> {
  const resolvedPromise = fakeDelay > 0 ? promise.then((value) => delay(fakeDelay).then(() => value)) : promise

  const { promise: slowPromise, resolve: resolveSlow, cancel: cancelSlow } = createImperativePromise<void>()

  void delay(maxDuration).then(() => {
    resolveSlow({ cancelled: false, data: undefined })
  })

  void slowPromise.then((result) => {
    if (result.cancelled) {
      return
    }

    onSlow()
  })

  try {
    return await resolvedPromise
  } finally {
    cancelSlow()
  }
}
