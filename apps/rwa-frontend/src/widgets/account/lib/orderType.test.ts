import { OrderClass } from '@cowprotocol/cow-sdk'

import { getOrderType } from './orderType'

function appData(orderClass: string): string {
  return JSON.stringify({ appCode: 'CoW RWA', metadata: { orderClass: { orderClass } } })
}

describe('getOrderType', () => {
  it.each([
    ['market', 'swap'],
    ['hooks', 'swap'],
    ['limit', 'limit'],
    ['liquidity', 'limit'],
    ['twap', 'twap'],
  ])('maps the app data order class %s to %s', (orderClass, type) => {
    expect(getOrderType({ class: OrderClass.LIMIT, fullAppData: appData(orderClass) })).toBe(type)
  })

  it('prefers the app data over the order book class, which marks zero-fee swaps as limit orders', () => {
    expect(getOrderType({ class: OrderClass.LIMIT, fullAppData: appData('market') })).toBe('swap')
  })

  it.each([
    ['missing', undefined],
    ['null', null],
    ['invalid', '{not json'],
    ['without an order class', JSON.stringify({ metadata: {} })],
    ['with an unknown order class', appData('unknown')],
  ])('falls back to the order book class when the app data is %s', (_case, fullAppData) => {
    expect(getOrderType({ class: OrderClass.MARKET, fullAppData })).toBe('swap')
    expect(getOrderType({ class: OrderClass.LIMIT, fullAppData })).toBe('limit')
  })
})
