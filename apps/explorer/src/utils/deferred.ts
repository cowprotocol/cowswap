export type PromiseResolve<T> = (value: T | PromiseLike<T>) => void
export type PromiseReject = (reason?: unknown) => void

export interface Deferred<T> extends Promise<T> {
  resolve: PromiseResolve<T>
  reject: PromiseReject
}

export const createDeferredPromise = <T>(): Deferred<T> => {
  let resolve: PromiseResolve<T> = () => void 0
  let reject: PromiseReject = () => void 0

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return Object.assign(promise, {
    resolve,
    reject,
  })
}
