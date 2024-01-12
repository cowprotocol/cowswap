import ms from 'ms'

import { TwapOrdersDeadline } from '../state/twapOrdersSettingsAtom'

const [oneD, oneH, oneM, oneS] = [ms('1d'), ms('1h'), ms('1m'), ms('1s')]
const oneYear = oneD * 365 // this is not very precise...
const oneMonth = oneYear / 12 // this is much less precise...

export function customDeadlineToSeconds(customDeadline: TwapOrdersDeadline['customDeadline']): number {
  const hoursToMinutes = customDeadline.hours * 60

  return (hoursToMinutes + customDeadline.minutes) * 60
}

export function deadlinePartsDisplay(timeInterval: number, longLabels = false): string {
  const timeMs = ms(`${timeInterval * 1000}ms`)

  const years = Math.floor(timeMs / oneYear)
  const months = Math.floor((timeMs % oneYear) / oneMonth)
  const days = Math.floor((timeMs % oneMonth) / oneD)
  const hours = Math.floor((timeMs % oneD) / oneH)
  const minutes = Math.floor((timeMs % oneH) / oneM)
  const seconds = Math.floor((timeMs % oneM) / oneS)

  return [
    [years, longLabels ? ' years' : 'y'],
    [months, longLabels ? ' months' : 'mo'],
    [days, longLabels ? ' days' : 'd'],
    [hours, longLabels ? ' hours' : 'h'],
    [minutes, longLabels ? ' minutes' : 'm'],
    [seconds, longLabels ? ' seconds' : 's'],
  ]
    .filter(([value]) => !!value)
    .map(([value, suffix]) => `${value}${suffix}`)
    .join(' ')
}
