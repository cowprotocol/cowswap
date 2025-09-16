import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import ms from 'ms.macro'
import { format } from 'timeago.js'

import { MAX_ORDER_DEADLINE } from 'common/constants/common'

export interface LimitOrderDeadline {
  title: MessageDescriptor | string
  value: number
}

export const MIN_CUSTOM_DEADLINE = ms`30min`
export const MAX_CUSTOM_DEADLINE = MAX_ORDER_DEADLINE

export const defaultLimitOrderDeadline: LimitOrderDeadline = { title: msg`7 Days`, value: ms`7d` }

export const LIMIT_ORDERS_DEADLINES: LimitOrderDeadline[] = [
  { title: msg`5 Minutes`, value: ms`5m` },
  { title: msg`30 Minutes`, value: ms`30m` },
  { title: msg`1 Hour`, value: ms`1 hour` },
  { title: msg`1 Day`, value: ms`1d` },
  { title: msg`3 Days`, value: ms`3d` },
  defaultLimitOrderDeadline,
  { title: msg`1 Month`, value: ms`30d` },
  { title: msg`1 Year (max)`, value: MAX_CUSTOM_DEADLINE },
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
