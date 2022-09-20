import useLast from '@uni_src/hooks/useLast'

export * from '@uni_src/hooks/useLast'

function isDefined<T>(x: T | null | undefined): x is T {
  return x !== null && x !== undefined
}

/**
 * Returns the last truthy value of type T
 * @param value changing value
 */
export function useLastTruthy<T>(value: T | undefined | null): T | null | undefined {
  return useLast(value, isDefined)
}

export default useLast
