import { OrderKind } from '@cowprotocol/cow-sdk'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { getOrderFilledAmount } from './getOrderFilledAmount'

function buildOrder(apiAdditionalInfo: Partial<NonNullable<Order['apiAdditionalInfo']>> | undefined): Order {
  return {
    kind: OrderKind.SELL,
    sellAmount: '1000000',
    status: OrderStatus.FULFILLED,
    apiAdditionalInfo: apiAdditionalInfo as Order['apiAdditionalInfo'],
  } as unknown as Order
}

describe('getOrderFilledAmount', () => {
  it('returns zero when the order has no apiAdditionalInfo yet', () => {
    const order = buildOrder(undefined)

    expect(getOrderFilledAmount(order).amount.toString()).toBe('0')
  })

  it('subtracts the executed fee from the executed sell amount', () => {
    const order = buildOrder({ executedSellAmount: '1000000', executedFeeAmount: '3000' })

    expect(getOrderFilledAmount(order).amount.toString()).toBe('997000')
  })

  // Solana's order API doesn't return `executedFeeAmount` (unlike EVM chains) even though the SDK
  // type declares it as required — treating the missing fee as zero avoids `BigNumber.minus(undefined)`
  // producing NaN, which `legacyBigNumberToCurrencyAmount` (getFilledAmounts.ts) then silently displays
  // as a sell amount of 0 in the "Order filled" snackbar.
  it('treats a missing executed fee as zero instead of producing NaN', () => {
    const order = buildOrder({ executedSellAmount: '1000000', executedFeeAmount: undefined })

    const { amount } = getOrderFilledAmount(order)

    expect(amount.isNaN()).toBe(false)
    expect(amount.toString()).toBe('1000000')
  })
})
