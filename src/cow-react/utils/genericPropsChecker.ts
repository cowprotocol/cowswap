/**
 * This is a function for generic React.memo() usage
 * The function compares previous and next props by values using JSON.stringify. It returns true when props are equal and vice versa
 */
export function genericPropsChecker(prev: any, next: any): boolean {
  if (typeof prev === 'object' && prev !== null) {
    const prevKeys = Object.keys(prev)
    const nextKeys = Object.keys(next)

    if (nextKeys.length !== prevKeys.length) return false

    return nextKeys.every((key) => {
      const prevValue = prev[key]
      const nextValue = next[key]

      /* In case when value is object we go into recursion.
      For example:

      props = {
        id: 10,
        options: {
          option1: { foo: 'bar' },
          keys: [5, 6],
        },
      }

      When we get `options` key we detect that it's an object and check it through genericPropsChecker again recursively
      And we do it until we met not object value (primitive, array, function)
      */
      if (typeof nextValue === 'object' && !Array.isArray(nextValue) && nextValue !== null) {
        return genericPropsChecker(prevValue, nextValue)
      }

      // We shouldn't check functions using JSON.stringify because it always returns true
      if (typeof prevValue === 'function' || typeof nextValue === 'function') {
        return prevValue === nextValue
      }

      return JSON.stringify(prevValue) === JSON.stringify(nextValue)
    })
  }

  return prev === next
}
