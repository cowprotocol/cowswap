/**
 * This is a function for generic React.memo() usage
 * The function compares previous and next props. It returns true when props are equal and vice versa
 */
export function genericPropsChecker(prev: any, next: any): boolean {
  if (typeof prev === 'object') {
    const prevKeys = Object.keys(prev)
    const nextKeys = Object.keys(next)
    // Just in case, we take the longest list of keys
    const keys = prevKeys.length > nextKeys.length ? prevKeys : nextKeys

    return keys.every((key) => {
      const prevValue = prev[key]
      const nextValue = next[key]

      // We shouldn't check functions using JSON.stringify because it always returns true
      if (typeof prevValue === 'function' || typeof nextValue === 'function') {
        return prevValue === nextValue
      }

      return JSON.stringify(prevValue) === JSON.stringify(nextValue)
    })
  }

  return prev === next
}
