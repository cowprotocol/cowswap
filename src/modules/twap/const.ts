import ms from 'ms.macro'

export type OrderDeadline = { label: string; value: number }

export const defaultOrderDeadline: OrderDeadline = { label: '1 Hour', value: ms`1 hour` }

export const orderDeadlines: OrderDeadline[] = [
  { label: '5 Minutes', value: ms`5m` },
  { label: '30 Minutes', value: ms`30m` },
  defaultOrderDeadline,
  { label: '1 Day', value: ms`1d` },
  { label: '3 Days', value: ms`3d` },
  { label: '7 Days', value: ms`7d` },
  { label: '1 Month', value: ms`30d` },
]
