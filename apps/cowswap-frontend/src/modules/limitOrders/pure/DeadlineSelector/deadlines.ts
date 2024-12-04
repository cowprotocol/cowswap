import ms from 'ms.macro'
import { format } from 'timeago.js'

import { MAX_ORDER_DEADLINE } from 'common/constants/common'

export interface LimitOrderDeadline {
  title: string
  value: number
}

export const MIN_CUSTOM_DEADLINE = ms`30min`
export const MAX_CUSTOM_DEADLINE = MAX_ORDER_DEADLINE

export enum LimitOrderDeadlinePreset {
  FIVE_MINUTES = '5 Minutes',
  THIRTY_MINUTES = '30 Minutes',
  ONE_HOUR = '1 Hour',
  ONE_DAY = '1 Day',
  THREE_DAYS = '3 Days',
  ONE_MONTH = '1 Month',
  SIX_MONTHS = '6 Months (max)',
}

const DEADLINE_VALUES: Record<LimitOrderDeadlinePreset, number> = {
  [LimitOrderDeadlinePreset.FIVE_MINUTES]: ms`5m`,
  [LimitOrderDeadlinePreset.THIRTY_MINUTES]: ms`30m`,
  [LimitOrderDeadlinePreset.ONE_HOUR]: ms`1 hour`,
  [LimitOrderDeadlinePreset.ONE_DAY]: ms`1d`,
  [LimitOrderDeadlinePreset.THREE_DAYS]: ms`3d`,
  [LimitOrderDeadlinePreset.ONE_MONTH]: ms`30d`,
  [LimitOrderDeadlinePreset.SIX_MONTHS]: MAX_CUSTOM_DEADLINE,
}

export const defaultLimitOrderDeadline: LimitOrderDeadline = {
  title: LimitOrderDeadlinePreset.SIX_MONTHS,
  value: DEADLINE_VALUES[LimitOrderDeadlinePreset.SIX_MONTHS],
}

export const LIMIT_ORDERS_DEADLINES: LimitOrderDeadline[] = Object.entries(DEADLINE_VALUES).map(([title, value]) => ({
  title,
  value,
}))

/**
 * Get limit order deadlines and optionally adds
 * @param value
 */
export function getLimitOrderDeadlines(value?: number | LimitOrderDeadline): LimitOrderDeadline[] {
  if (!value || LIMIT_ORDERS_DEADLINES.find((item) => item === value || item.value === value)) {
    return LIMIT_ORDERS_DEADLINES
  }

  const itemToAdd = typeof value === 'number' ? buildLimitOrderDeadline(value) : value

  return [...LIMIT_ORDERS_DEADLINES, itemToAdd].sort((a, b) => a.value - b.value)
}

/**
 * Builds a LimitOrderDeadline from milliseconds value.
 * Uses timeago to an approximate title
 */
export function buildLimitOrderDeadline(value: number): LimitOrderDeadline {
  const title = format(Date.now() + value, undefined).replace(/in /, '')

  return { title, value }
}
