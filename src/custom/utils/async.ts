// // TODO: If this work our, I will move it to my own library
// This logic is a modified version of:
//    https://github.com/slorber/awesome-only-resolves-last-promise
//    https://github.com/slorber/awesome-imperative-promise
// Main difference, is that cancel resolves the promise with a cancelled flag to true

export type ResolveCallback<T> = (value: CancelableResult<T>) => void
export type RejectCallback = (reason?: any) => void
export type CancelCallback = () => void

export type ImperativePromise<T> = {
  promise: Promise<CancelableResult<T>>
  resolve: ResolveCallback<T>
  reject: RejectCallback
  cancel: CancelCallback
}

export type CancelableResult<T> = CancelledResult | SuccessResult<T>

export type CancelledResult = {
  cancelled: true
  data: undefined
}

export type SuccessResult<T> = {
  cancelled: false
  data: T
}

export function createImperativePromise<T>(promiseArg?: Promise<T> | null | undefined): ImperativePromise<T> {
  let resolve: ResolveCallback<T> | null = null
  let reject: RejectCallback | null = null

  const wrappedPromise = new Promise<CancelableResult<T>>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  promiseArg &&
    promiseArg.then(
      data => {
        resolve &&
          resolve({
            cancelled: false,
            data
          })
      },
      error => {
        reject && reject(error)
      }
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
    reject: (reason?: any) => {
      reject && reject(reason)
    },
    cancel: () => {
      resolve && resolve({ cancelled: true, data: undefined })
    }
  }
}

type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never
type AsyncFunction<T> = (...args: any[]) => Promise<T>

// see https://stackoverflow.com/a/54825370/82609
export function onlyResolvesLast<R>(
  asyncFunction: AsyncFunction<R>
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
