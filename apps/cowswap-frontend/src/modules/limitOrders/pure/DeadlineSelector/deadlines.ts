import ms from 'ms.macro'

import { MAX_ORDER_DEADLINE } from 'common/constants/common'

export interface LimitOrderDeadline {
  title: string
  value: number
}

export const MIN_CUSTOM_DEADLINE = ms`30min`
export const MAX_CUSTOM_DEADLINE = MAX_ORDER_DEADLINE

export const defaultLimitOrderDeadline: LimitOrderDeadline = { title: '7 Days', value: ms`7d` }

export const limitOrdersDeadlines: LimitOrderDeadline[] = [
  { title: '5 Minutes', value: ms`5m` },
  { title: '30 Minutes', value: ms`30m` },
  { title: '1 Hour', value: ms`1 hour` },
  { title: '1 Day', value: ms`1d` },
  { title: '3 Days', value: ms`3d` },
  defaultLimitOrderDeadline,
  { title: '1 Month', value: ms`30d` },
  { title: '6 Months (max)', value: MAX_CUSTOM_DEADLINE },
]
