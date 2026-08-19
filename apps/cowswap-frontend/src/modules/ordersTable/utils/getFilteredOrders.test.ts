import { OrderStatus } from 'legacy/state/orders/actions'

import { getFilteredOrders, HistoryStatusFilter } from './getFilteredOrders'

import { ordersMock } from '../test/ordersTable.mock'

describe('getFilteredOrders', () => {
  it('filters EOA TWAP parents with the shared history statuses', () => {
    const expired = { ...ordersMock[2], id: 'expired', isEoaTwapOrder: true }
    const filled = { ...ordersMock[3], id: 'filled', isEoaTwapOrder: true }
    const cancelled = { ...expired, id: 'cancelled', status: OrderStatus.CANCELLED }
    const partiallyFilled = {
      ...expired,
      id: 'partially-filled',
      status: OrderStatus.CANCELLED,
      executionData: {
        ...filled.executionData,
        executedBuyAmount: '1',
        executedSellAmount: '1',
        executedSellAmountBeforeFees: '1',
        filledPercentDisplay: '10',
        fullyFilled: false,
        partiallyFilled: true,
      },
    }
    const orders = [filled, partiallyFilled, cancelled, expired]

    expect(filterIds(orders, HistoryStatusFilter.FILLED)).toEqual(['filled'])
    expect(filterIds(orders, HistoryStatusFilter.PARTIALLY_FILLED)).toEqual(['partially-filled'])
    expect(filterIds(orders, HistoryStatusFilter.CANCELLED)).toEqual(['cancelled'])
    expect(filterIds(orders, HistoryStatusFilter.EXPIRED)).toEqual(['expired'])
    expect(filterIds(orders, HistoryStatusFilter.ALL)).toEqual(['filled', 'partially-filled', 'cancelled', 'expired'])
  })

  it('includes fulfilled orders whose execution fee lowers the displayed fill percentage', () => {
    const filled = {
      ...ordersMock[3],
      id: 'fee-reduced-filled',
      executionData: {
        ...ordersMock[3].executionData,
        executedFeeAmount: '1000000000000',
      },
    }

    expect(filterIds([filled], HistoryStatusFilter.FILLED)).toEqual(['fee-reduced-filled'])
  })
})

function filterIds(orders: typeof ordersMock, historyStatusFilter: HistoryStatusFilter): string[] {
  return getFilteredOrders(orders, { searchTerm: '', historyStatusFilter }).map(({ id }) => id)
}
