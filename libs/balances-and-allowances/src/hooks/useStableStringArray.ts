import { useState } from 'react'

/**
 * Returns the previous array reference when the new value is element-wise
 * equal — so downstream effects that depend on the array identity only re-run
 * when the list contents actually change, not on every parent render.
 *
 * Uses the React-blessed "storing information from previous renders" pattern
 * (useState + bail-out) instead of a ref so the value is read consistently
 * within a render.
 */
export function useStableStringArray(value: string[]): string[] {
  const [stable, setStable] = useState<string[]>(value)
  if (!shallowEqualStringArrays(stable, value)) {
    setStable(value)
    return value
  }
  return stable
}

function shallowEqualStringArrays(a: readonly string[], b: readonly string[]): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
