import ms from 'ms'

import { TwapOrdersDeadline } from '../state/twapOrdersSettingsAtom'

const [oneD, oneH, oneM, oneS] = [ms('1d'), ms('1h'), ms('1m'), ms('1s')]

export function customDeadlineToSeconds(customDeadline: TwapOrdersDeadline['customDeadline']): number {
  const hoursToMinutes = customDeadline.hours * 60
  const minutesToSeconds = (hoursToMinutes + customDeadline.minutes) * 60

  return minutesToSeconds
}

export function deadlinePartsDisplay(timeInterval: number): string {
  const timeMs = ms(`${timeInterval * 1000}ms`)

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
