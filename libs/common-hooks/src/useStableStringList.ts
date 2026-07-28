import { useState } from 'react'

/** Returns a referentially stable array while its string contents are unchanged. */
export function useStableStringList(list: string[]): string[] {
  const [stable, setStable] = useState(list)

  if (stable === list) return stable

  const changed = stable.length !== list.length || stable.some((value, index) => value !== list[index])

  if (changed) {
    setStable(list)
    return list
  }

  return stable
}
