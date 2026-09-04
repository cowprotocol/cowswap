export interface GroupedOrdersByDate<T> {
  id: OrdersDateGroup
  items: T[]
}

export enum OrdersDateGroup {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  EARLIER_THIS_WEEK = 'earlier-this-week',
  EARLIER_THIS_MONTH = 'earlier-this-month',
  OLDER = 'older',
}

interface DateBoundaries {
  today: number
  yesterday: number
  week: number
  month: number
}

const GROUP_ORDER = [
  OrdersDateGroup.TODAY,
  OrdersDateGroup.YESTERDAY,
  OrdersDateGroup.EARLIER_THIS_WEEK,
  OrdersDateGroup.EARLIER_THIS_MONTH,
  OrdersDateGroup.OLDER,
] as const

export function groupOrdersByDate<T>(
  items: T[],
  getDate: (item: T) => Date,
  now = new Date(),
): GroupedOrdersByDate<T>[] {
  const groups: Record<OrdersDateGroup, T[]> = {
    [OrdersDateGroup.TODAY]: [],
    [OrdersDateGroup.YESTERDAY]: [],
    [OrdersDateGroup.EARLIER_THIS_WEEK]: [],
    [OrdersDateGroup.EARLIER_THIS_MONTH]: [],
    [OrdersDateGroup.OLDER]: [],
  }

  const boundaries = getDateBoundaries(now)

  items.forEach((item) => {
    groups[getOrdersDateGroup(getDate(item), boundaries)].push(item)
  })

  return GROUP_ORDER.map((id) => ({ id, items: groups[id] })).filter(({ items }) => items.length > 0)
}

export function shouldShowOrdersDateGroupHeading(group: OrdersDateGroup, totalGroups: number): boolean {
  return group !== OrdersDateGroup.OLDER || totalGroups > 1
}

function getDateBoundaries(now: Date): DateBoundaries {
  const today = startOfDay(now)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const week = new Date(today)
  const daysSinceMonday = (today.getDay() + 6) % 7
  week.setDate(today.getDate() - daysSinceMonday)

  const month = new Date(today.getFullYear(), today.getMonth(), 1)

  return {
    today: today.getTime(),
    yesterday: yesterday.getTime(),
    week: week.getTime(),
    month: month.getTime(),
  }
}

function getOrdersDateGroup(date: Date, boundaries: DateBoundaries): OrdersDateGroup {
  const timestamp = date.getTime()

  if (timestamp >= boundaries.today) return OrdersDateGroup.TODAY
  if (timestamp >= boundaries.yesterday) return OrdersDateGroup.YESTERDAY
  if (timestamp >= boundaries.week) return OrdersDateGroup.EARLIER_THIS_WEEK
  if (timestamp >= boundaries.month) return OrdersDateGroup.EARLIER_THIS_MONTH

  return OrdersDateGroup.OLDER
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
