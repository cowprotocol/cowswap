import { groupOrdersByDate, OrdersDateGroup, shouldShowOrdersDateGroupHeading } from './groupOrdersByDate.utils'

interface DatedItem {
  id: string
  createdAt: Date
}

describe('groupOrdersByDate', () => {
  const now = new Date(2026, 7, 19, 12)

  it('groups local calendar dates in newest-first label order', () => {
    const items: DatedItem[] = [
      { id: 'today', createdAt: new Date(2026, 7, 19, 9) },
      { id: 'yesterday', createdAt: new Date(2026, 7, 18, 23, 59) },
      { id: 'week', createdAt: new Date(2026, 7, 17, 8) },
      { id: 'month', createdAt: new Date(2026, 7, 5, 8) },
      { id: 'older', createdAt: new Date(2026, 6, 31, 8) },
    ]

    expect(groupOrdersByDate(items, ({ createdAt }) => createdAt, now)).toEqual([
      { id: OrdersDateGroup.TODAY, items: [items[0]] },
      { id: OrdersDateGroup.YESTERDAY, items: [items[1]] },
      { id: OrdersDateGroup.EARLIER_THIS_WEEK, items: [items[2]] },
      { id: OrdersDateGroup.EARLIER_THIS_MONTH, items: [items[3]] },
      { id: OrdersDateGroup.OLDER, items: [items[4]] },
    ])
  })

  it('omits empty groups and preserves item order within a group', () => {
    const newest = { id: 'newest', createdAt: new Date(2026, 7, 19, 11) }
    const older = { id: 'older', createdAt: new Date(2026, 7, 19, 9) }

    expect(groupOrdersByDate([newest, older], ({ createdAt }) => createdAt, now)).toEqual([
      { id: OrdersDateGroup.TODAY, items: [newest, older] },
    ])
  })

  it('uses calendar-day boundaries instead of fixed 24-hour durations', () => {
    const beforeMidnight = { id: 'yesterday', createdAt: new Date(2026, 7, 18, 23, 59, 59) }

    expect(groupOrdersByDate([beforeMidnight], ({ createdAt }) => createdAt, new Date(2026, 7, 19, 0, 1))).toEqual([
      { id: OrdersDateGroup.YESTERDAY, items: [beforeMidnight] },
    ])
  })

  it('hides Older only when it is the sole date group', () => {
    expect(shouldShowOrdersDateGroupHeading(OrdersDateGroup.OLDER, 1)).toBe(false)
    expect(shouldShowOrdersDateGroupHeading(OrdersDateGroup.OLDER, 2)).toBe(true)
    expect(shouldShowOrdersDateGroupHeading(OrdersDateGroup.TODAY, 1)).toBe(true)
  })
})
