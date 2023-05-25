import { TwapOrdersDeadline } from '../state/twapOrdersSettingsAtom'
import ms from 'ms'

const [oneD, oneH, oneM, oneS] = [ms('1d'), ms('1h'), ms('1m'), ms('1s')]

function customDeadlineToTimestamp(customDeadline: TwapOrdersDeadline['customDeadline']): number {
  const hoursToMinutes = customDeadline.hours * 60
  const minutesToSeconds = (hoursToMinutes + customDeadline.minutes) * 60

  return minutesToSeconds * 1000
}

export function deadlinePartsDisplay(
  numberOfParts: number,
  { isCustomDeadline, customDeadline, deadline }: TwapOrdersDeadline
): string {
  const timestamp = isCustomDeadline ? customDeadlineToTimestamp(customDeadline) : deadline
  const timeMs = ms(`${timestamp / numberOfParts}ms`)

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
