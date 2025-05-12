import ms from 'ms'

const [oneD, oneH, oneM, oneS] = [ms('1d'), ms('1h'), ms('1m'), ms('1s')]

/**
 * Helper function to add correct plural suffix to time units
 * @param num The number value
 * @param label The base label for the unit (e.g., "hr", "min", "sec")
 * @returns Formatted string with proper pluralization
 */
const addPluralSuffix = (num: number, label: string): string =>
  num % 10 === 1 && num % 100 !== 11 ? `${label}` : label

/**
 * Formats time in milliseconds into a human-readable string
 * @param time Time in milliseconds
 * @param expandedUnits If true, uses expanded unit names (e.g., "30 sec", "5 min", "2 hrs") instead of compact ones (e.g., "30s", "5m", "2h")
 * @returns Formatted time string
 */
export function displayTime(time: number, expandedUnits = false): string {
  const timeMs = ms(`${time}ms`)

  // For expanded units format, use a different approach based on the largest unit
  if (expandedUnits) {
    const days = Math.floor(timeMs / oneD)
    const hours = Math.floor((timeMs % oneD) / oneH)
    const minutes = Math.floor((timeMs % oneH) / oneM)
    const seconds = Math.floor((timeMs % oneM) / oneS)

    const parts = [
      [days, addPluralSuffix(days, 'day')],
      [hours, addPluralSuffix(hours, 'hr')],
      [minutes, addPluralSuffix(minutes, 'min')],
      [seconds, addPluralSuffix(seconds, 'sec')],
    ]
      .filter(([value]) => !!value)
      .map(([value, label]) => `${value} ${label}`)

    return parts.join(' ')
  }

  // Original implementation for compact format
  const days = Math.floor(timeMs / oneD)
  const hours = Math.floor((timeMs % oneD) / oneH)
  const minutes = Math.floor((timeMs % oneH) / oneM)
  const seconds = Math.floor((timeMs % oneM) / oneS)

  return [
    [days, 'd'],
    [hours, 'h'],
    [minutes, 'm'],
    [seconds, 's'],
  ]
    .filter(([value]) => !!value)
    .map(([value, suffix]) => `${value}${suffix}`)
    .join(' ')
}
