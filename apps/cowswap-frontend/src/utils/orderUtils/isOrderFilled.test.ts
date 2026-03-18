import { OrderClass } from '@cowprotocol/cow-sdk'

import { OrderStatus } from 'legacy/state/orders/actions'

import { isOrderFilled } from './isOrderFilled'

describe('isOrderFilled', () => {
  it('uses executedSellAmountBeforeFees for sell orders when it is available', () => {
    expect(
      isOrderFilled({
        status: OrderStatus.CANCELLED,
        class: OrderClass.MARKET,
        kind: 'sell',
        sellAmount: '100',
        buyAmount: '0',
        apiAdditionalInfo: {
          executedSellAmount: '95',
          executedSellAmountBeforeFees: '100',
          executedFeeAmount: '5',
          executedBuyAmount: '1000',
        },
      } as never),
    ).toBe(true)
  })

  it('falls back to net executed sell amount when sell limit orders report zero before-fees amount', () => {
    expect(
      isOrderFilled({
        status: OrderStatus.CANCELLED,
        class: OrderClass.LIMIT,
        kind: 'sell',
        sellAmount: '100',
        buyAmount: '0',
        apiAdditionalInfo: {
          executedSellAmount: '105',
          executedSellAmountBeforeFees: '0',
          executedFeeAmount: '5',
          executedBuyAmount: '1000',
        },
      } as never),
    ).toBe(true)
  })

  it('does not overcount fee-inclusive sell amounts when the limit order is not actually fully filled', () => {
    expect(
      isOrderFilled({
        status: OrderStatus.CANCELLED,
        class: OrderClass.LIMIT,
        kind: 'sell',
        sellAmount: '100',
        buyAmount: '0',
        apiAdditionalInfo: {
          executedSellAmount: '104',
          executedSellAmountBeforeFees: '0',
          executedFeeAmount: '5',
          executedBuyAmount: '1000',
        },
      } as never),
    ).toBe(false)
  })

  it('still uses executedBuyAmount for buy orders', () => {
    expect(
      isOrderFilled({
        status: OrderStatus.CANCELLED,
        class: OrderClass.LIMIT,
        kind: 'buy',
        sellAmount: '0',
        buyAmount: '1000',
        apiAdditionalInfo: {
          executedSellAmount: '100',
          executedSellAmountBeforeFees: '100',
          executedFeeAmount: '5',
          executedBuyAmount: '1000',
        },
      } as never),
    ).toBe(true)
  })

  it('trusts the precomputed parsed-order filled flag', () => {
    expect(
      isOrderFilled({
        status: OrderStatus.CANCELLED,
        class: OrderClass.LIMIT,
        kind: 'sell',
        sellAmount: '100',
        buyAmount: '0',
        executionData: {
          fullyFilled: true,
          executedSellAmount: 0n,
          executedBuyAmount: 0n,
        },
      } as never),
    ).toBe(true)
  })
})
