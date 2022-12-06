import ms from 'ms.macro'

export interface LimitOrderDeadline {
  title: string
  value: number
}

export const maxCustomDeadline = ms`1y`

export const defaultLimitOrderDeadline: LimitOrderDeadline = { title: '1 Hour', value: ms`1 hour` }

export const limitOrdersDeadlines: LimitOrderDeadline[] = [
  { title: '5 Minutes', value: ms`5m` },
  { title: '30 Minutes', value: ms`30m` },
  defaultLimitOrderDeadline,
  { title: '1 Day', value: ms`1d` },
]
