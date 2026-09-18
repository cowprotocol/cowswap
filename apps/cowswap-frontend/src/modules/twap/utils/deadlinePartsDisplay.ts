import { plural, t } from '@lingui/core/macro'
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

  // The count sits inside each plural message so translators get the number and the noun together;
  // short labels are bare abbreviations, which need no agreement.
  const parts: [number, string][] = [
    [
      years,
      longLabels
        ? plural(years, { one: '# year', few: '# years', many: '# years', other: '# years' })
        : `${years}${t`y`}`,
    ],
    [
      months,
      longLabels
        ? plural(months, { one: '# month', few: '# months', many: '# months', other: '# months' })
        : `${months}${t`mo`}`,
    ],
    [
      days,
      longLabels ? plural(days, { one: '# day', few: '# days', many: '# days', other: '# days' }) : `${days}${t`d`}`,
    ],
    [
      hours,
      longLabels
        ? plural(hours, { one: '# hour', few: '# hours', many: '# hours', other: '# hours' })
        : `${hours}${t`h`}`,
    ],
    [
      minutes,
      longLabels
        ? plural(minutes, { one: '# minute', few: '# minutes', many: '# minutes', other: '# minutes' })
        : `${minutes}${t`m`}`,
    ],
    [
      seconds,
      longLabels
        ? plural(seconds, { one: '# second', few: '# seconds', many: '# seconds', other: '# seconds' })
        : `${seconds}${t`s`}`,
    ],
  ]

  return parts
    .filter(([value]) => !!value)
    .map(([, label]) => label)
    .join(' ')
}
