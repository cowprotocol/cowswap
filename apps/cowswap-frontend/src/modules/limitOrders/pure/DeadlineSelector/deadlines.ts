import ms from 'ms.macro'
import { format } from 'timeago.js'

import { MAX_ORDER_DEADLINE } from 'common/constants/common'

export interface LimitOrderDeadline {
  title: string
  value: number
}

export const MIN_CUSTOM_DEADLINE = ms`30min`
export const MAX_CUSTOM_DEADLINE = MAX_ORDER_DEADLINE

export const defaultLimitOrderDeadline: LimitOrderDeadline = { title: '7 Days', value: ms`7d` }

export const LIMIT_ORDERS_DEADLINES: LimitOrderDeadline[] = [
  { title: '5 Minutes', value: ms`5m` },
  { title: '30 Minutes', value: ms`30m` },
  { title: '1 Hour', value: ms`1 hour` },
  { title: '1 Day', value: ms`1d` },
  { title: '3 Days', value: ms`3d` },
  defaultLimitOrderDeadline,
  { title: '1 Month', value: ms`30d` },
  { title: '1 Year (max)', value: MAX_CUSTOM_DEADLINE },
]

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
