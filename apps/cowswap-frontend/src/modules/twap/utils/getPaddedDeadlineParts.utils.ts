import { t } from '@lingui/core/macro'
import ms from 'ms'

const [oneD, oneH, oneM, oneS] = [ms('1d'), ms('1h'), ms('1m'), ms('1s')]
const oneYear = oneD * 365
const oneMonth = oneYear / 12

export interface PaddedDeadlinePart {
  unit: PaddedDeadlineUnit
  value: number
  label: string
  isSignificant: boolean
}

export type PaddedDeadlineUnit = 'y' | 'mo' | 'd' | 'h' | 'm' | 's'

/**
 * Builds a fixed-width duration display: trim leading zero units only.
 * Middle and trailing zeros are kept (e.g. `09mo 18d 00h 09m 00s`) so the value does not shift.
 */
export function getPaddedDeadlineParts(timeIntervalSeconds: number): PaddedDeadlinePart[] {
  let remainingMs = Math.max(0, timeIntervalSeconds) * 1000

  const years = Math.floor(remainingMs / oneYear)
  remainingMs %= oneYear
  const months = Math.floor(remainingMs / oneMonth)
  remainingMs %= oneMonth
  const days = Math.floor(remainingMs / oneD)
  remainingMs %= oneD
  const hours = Math.floor(remainingMs / oneH)
  remainingMs %= oneH
  const minutes = Math.floor(remainingMs / oneM)
  remainingMs %= oneM
  const seconds = Math.floor(remainingMs / oneS)

  const unitLabels = {
    y: t`y`,
    mo: t`mo`,
    d: t`d`,
    h: t`h`,
    m: t`m`,
    s: t`s`,
  } as const satisfies Record<PaddedDeadlineUnit, string>

  const parts: Omit<PaddedDeadlinePart, 'isSignificant'>[] = [
    { unit: 'y', value: years, label: `${String(years).padStart(2, '0')}${unitLabels.y}` },
    { unit: 'mo', value: months, label: `${String(months).padStart(2, '0')}${unitLabels.mo}` },
    { unit: 'd', value: days, label: `${String(days).padStart(2, '0')}${unitLabels.d}` },
    { unit: 'h', value: hours, label: `${String(hours).padStart(2, '0')}${unitLabels.h}` },
    { unit: 'm', value: minutes, label: `${String(minutes).padStart(2, '0')}${unitLabels.m}` },
    { unit: 's', value: seconds, label: `${String(seconds).padStart(2, '0')}${unitLabels.s}` },
  ]

  const firstSignificantIndex = parts.findIndex(({ value }) => value > 0)
  const startIndex = firstSignificantIndex === -1 ? parts.length - 1 : firstSignificantIndex

  return parts.slice(startIndex).map((part) => ({
    ...part,
    isSignificant: part.value > 0,
  }))
}
