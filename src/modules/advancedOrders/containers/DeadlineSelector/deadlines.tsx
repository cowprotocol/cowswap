import ms from 'ms.macro'

export interface OrderDeadline {
  title: string
  value: number
}

export const MIN_CUSTOM_DEADLINE = ms`30min`
export const MAX_CUSTOM_DEADLINE = Math.round(ms`1y` / 2) // 6 months

export const defaultOrderDeadline: OrderDeadline = { title: '1 Hour', value: ms`1 hour` }

export const ordersDeadlines: OrderDeadline[] = [
  { title: '5 Minutes', value: ms`5m` },
  { title: '30 Minutes', value: ms`30m` },
  defaultOrderDeadline,
  { title: '1 Day', value: ms`1d` },
  { title: '3 Days', value: ms`3d` },
  { title: '7 Days', value: ms`7d` },
  { title: '1 Month', value: ms`30d` },
]
