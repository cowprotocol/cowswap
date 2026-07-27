import { OrderStatus } from 'legacy/state/orders/actions'

import { getFilteredOrders, HistoryStatusFilter } from './getFilteredOrders'

import { ordersMock } from '../test/ordersTable.mock'

describe('getFilteredOrders', () => {
  it('filters EOA TWAP parents with the shared history statuses', () => {
    const expired = { ...ordersMock[2], id: 'expired', isEoaTwapOrder: true }
    const filled = { ...ordersMock[3], id: 'filled', isEoaTwapOrder: true }
    const cancelled = { ...expired, id: 'cancelled', status: OrderStatus.CANCELLED }
    const orders = [filled, cancelled, expired]

    expect(filterIds(orders, HistoryStatusFilter.FILLED)).toEqual(['filled'])
    expect(filterIds(orders, HistoryStatusFilter.CANCELLED)).toEqual(['cancelled'])
    expect(filterIds(orders, HistoryStatusFilter.EXPIRED)).toEqual(['expired'])
    expect(filterIds(orders, HistoryStatusFilter.ALL)).toEqual(['filled', 'cancelled', 'expired'])
  })
})

function filterIds(orders: typeof ordersMock, historyStatusFilter: HistoryStatusFilter): string[] {
  return getFilteredOrders(orders, { searchTerm: '', historyStatusFilter }).map(({ id }) => id)
}
