import { t } from '@lingui/core/macro'
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
    [years, longLabels ? ' ' + t`years` : t`y`],
    [months, longLabels ? ' ' + t`months` : t`mo`],
    [days, longLabels ? ' ' + t`days` : t`d`],
    [hours, longLabels ? ' ' + t`hours` : t`h`],
    [minutes, longLabels ? ' ' + t`minutes` : t`m`],
    [seconds, longLabels ? ' ' + t`seconds` : t`s`],
  ]
    .filter(([value]) => !!value)
    .map(([value, suffix]) => `${value}${suffix}`)
    .join(' ')
}
