import ms from 'ms'

const [oneD, oneH, oneM, oneS] = [ms('1d'), ms('1h'), ms('1m'), ms('1s')]

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
    if (timeMs < oneM) {
      const seconds = Math.round(timeMs / oneS)
      return `${seconds} sec`
    } else if (timeMs < oneH) {
      // Calculate minutes and remaining seconds
      const minutes = Math.floor(timeMs / oneM)
      const remainingSeconds = Math.round((timeMs % oneM) / oneS)
      // Return minutes only if seconds are 0
      if (remainingSeconds === 0) {
        return `${minutes} min`
      }
      // Return minutes and seconds
      return `${minutes} min ${remainingSeconds} sec`
    } else {
      const hours = Math.round(timeMs / oneH)
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`
    }
  }

  // Original implementation
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
