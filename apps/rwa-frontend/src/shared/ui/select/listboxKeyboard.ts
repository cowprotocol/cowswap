const NAVIGATION_KEYS: Record<string, (activeIndex: number, lastIndex: number) => number> = {
  ArrowDown: (activeIndex, lastIndex) => Math.min(activeIndex + 1, lastIndex),
  ArrowUp: (activeIndex) => Math.max(activeIndex - 1, 0),
  Home: () => 0,
  PageUp: () => 0,
  End: (_, lastIndex) => lastIndex,
  PageDown: (_, lastIndex) => lastIndex,
}

/**
 * The option a key moves to: arrows step, Home and End jump, and a printable character jumps to the next label that
 * starts with it, wrapping around. `null` for other keys
 */
export function getActiveIndexForKey(key: string, activeIndex: number, labels: string[]): number | null {
  const navigate = NAVIGATION_KEYS[key]

  if (navigate) return navigate(activeIndex, labels.length - 1)
  if (key.length !== 1 || key === ' ') return null

  const char = key.toLowerCase()

  for (let step = 1; step <= labels.length; step++) {
    const index = (activeIndex + step) % labels.length

    if (labels[index]?.toLowerCase().startsWith(char)) return index
  }

  return null
}
