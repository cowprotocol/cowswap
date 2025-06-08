import ms from 'ms'

const [oneD, oneH, oneM, oneS] = [ms('1d'), ms('1h'), ms('1m'), ms('1s')]

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const isPlural = (num: number) => (num > 10 ? num % 10 !== 1 : num !== 1)
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const addPluralSuffix = (num: number, label: string) => (isPlural(num) ? `${label}s` : label)

/**
 * Formats time in milliseconds into a human-readable string
 * @param time Time in milliseconds
 * @param expandedUnits If true, uses expanded unit names (e.g., "30 sec", "5 min", "2 hrs") instead of compact ones (e.g., "30s", "5m", "2h")
 * @returns Formatted time string
 */
export function displayTime(time: number, expandedUnits = false): string {
  const timeMs = ms(`${time}ms`)
  const days = Math.floor(timeMs / oneD)
  const hours = Math.floor((timeMs % oneD) / oneH)
  const minutes = Math.floor((timeMs % oneH) / oneM)
  const seconds = Math.floor((timeMs % oneM) / oneS)

  const separator = expandedUnits ? ' ' : ''

  const results = [
    [days, expandedUnits ? addPluralSuffix(days, 'day') : 'd'],
    [hours, expandedUnits ? addPluralSuffix(hours, 'hr') : 'h'],
    [minutes, expandedUnits ? addPluralSuffix(minutes, 'min') : 'm'],
    [seconds, expandedUnits ? addPluralSuffix(seconds, 'sec') : 's'],
  ]
    .filter(([value]) => !!value)
    .map(([value, suffix]) => `${value}${separator}${suffix}`)

  if (results.length) {
    return results.join(' ')
  }

  return expandedUnits ? '0 secs' : '0s'
}
