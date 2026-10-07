import { OrderKind } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { parseOrder } from './parseOrder'

const USDC = new Token(1, '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6, 'USDC')
const WETH = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH')

function buildOrder(apiAdditionalInfo: Record<string, unknown> | undefined): Order {
  return {
    id: '0xorder',
    kind: OrderKind.SELL,
    sellAmount: '1000000',
    buyAmount: '1000000000000000',
    feeAmount: '0',
    inputToken: USDC,
    outputToken: WETH,
    status: OrderStatus.FULFILLED,
    validTo: 0,
    creationTime: '2026-10-06T00:00:00Z',
    apiAdditionalInfo: apiAdditionalInfo as Order['apiAdditionalInfo'],
  } as unknown as Order
}

describe('parseOrder gasCost', () => {
  it('reads gasCost from the API order', () => {
    const order = buildOrder({ executedSellAmount: '1000000', executedBuyAmount: '1000000000000000', gasCost: '123' })

    expect(parseOrder(order).executionData.gasCost).toBe('123')
  })

  it('is null when the API order has none', () => {
    expect(parseOrder(buildOrder(undefined)).executionData.gasCost).toBeNull()
  })
})
