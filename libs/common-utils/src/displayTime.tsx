import ms from 'ms'

const [oneD, oneH, oneM, oneS] = [ms('1d'), ms('1h'), ms('1m'), ms('1s')]

/**
 * Helper function to add correct plural suffix to time units
 * @param num The number value
 * @param label The base label for the unit (e.g., "hr", "min", "sec")
 * @returns Formatted string with proper pluralization
 */
const plural = (num: number, label: string): string => `${label}${num === 1 ? '' : 's'}`

/**
 * Formats time in milliseconds into a human-readable string
 * @param time Time in milliseconds
 * @param expandedUnits If true, uses expanded unit names (e.g., "30 sec", "5 min", "2 hrs") instead of compact ones (e.g., "30s", "5m", "2h")
 * @returns Formatted time string
 */
export function displayTime(time: number, expandedUnits = false): string {
  const timeMs = time

  // Define units from largest to smallest
  const definedUnits = [
    { unitMs: oneD, label: 'day', compactSuffix: 'd' },
    { unitMs: oneH, label: 'hr', compactSuffix: 'h' },
    { unitMs: oneM, label: 'min', compactSuffix: 'm' },
    { unitMs: oneS, label: 'sec', compactSuffix: 's' },
  ]

  let remainingMs = timeMs
  const parts: string[] = []

  for (const { unitMs, label, compactSuffix } of definedUnits) {
    if (remainingMs >= unitMs) {
      const value = Math.floor(remainingMs / unitMs)
      if (value > 0) {
        if (expandedUnits) {
          parts.push(`${value} ${plural(value, label)}`)
        } else {
          parts.push(`${value}${compactSuffix}`)
        }
        remainingMs %= unitMs
      }
    }
  }

  // Handle zero or sub-second positive durations that didn't form a part
  if (parts.length === 0) {
    if (timeMs === 0) {
      return expandedUnits ? '0 secs' : '0s'
    }
    return expandedUnits ? '0 secs' : '0s'
  }

  return parts.join(' ')
}
