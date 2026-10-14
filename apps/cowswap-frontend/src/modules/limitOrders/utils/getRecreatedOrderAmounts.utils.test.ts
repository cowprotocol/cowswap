import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import { getOrderMock } from 'mocks/orderMock'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { parseOrder } from 'utils/orderUtils/parseOrder'

import { getRecreatedOrderAmounts } from './getRecreatedOrderAmounts.utils'

function buildOrder(
  overrides: Partial<Order> = {},
  execution: Partial<NonNullable<Order['apiAdditionalInfo']>> = {},
): Order {
  return {
    ...getOrderMock(SupportedChainId.MAINNET),
    status: OrderStatus.EXPIRED,
    partiallyFillable: true,
    sellAmount: '1000',
    feeAmount: '100',
    buyAmount: '2000',
    apiAdditionalInfo: {
      executedSellAmount: '440',
      executedFeeAmount: '40',
      executedBuyAmount: '900',
      ...execution,
    } as Order['apiAdditionalInfo'],
    ...overrides,
  }
}

describe('getRecreatedOrderAmounts', () => {
  it('uses unfilled sell volume, excluding executed fees and retaining the limit rate', () => {
    expect(getRecreatedOrderAmounts(buildOrder())).toEqual({
      inputCurrencyAmount: '660',
      outputCurrencyAmount: '1200',
    })
  })

  it('uses unfilled buy volume despite price improvement', () => {
    expect(getRecreatedOrderAmounts(buildOrder({ kind: OrderKind.BUY }))).toEqual({
      inputCurrencyAmount: '605',
      outputCurrencyAmount: '1100',
    })
  })

  it.each([OrderKind.SELL, OrderKind.BUY])('handles parsed %s orders like raw orders', (kind) => {
    const order = buildOrder({ kind })
    expect(getRecreatedOrderAmounts(parseOrder(order))).toEqual(getRecreatedOrderAmounts(order))
  })

  it.each([OrderStatus.PENDING, OrderStatus.CANCELLED, OrderStatus.FULFILLED])(
    'retains original amounts for %s orders',
    (status) => {
      expect(getRecreatedOrderAmounts(buildOrder({ status }))).toEqual({
        inputCurrencyAmount: '1100',
        outputCurrencyAmount: '2000',
      })
    },
  )

  it('retains original amounts for fill-or-kill orders', () => {
    expect(getRecreatedOrderAmounts(buildOrder({ partiallyFillable: false }))).toEqual({
      inputCurrencyAmount: '1100',
      outputCurrencyAmount: '2000',
    })
  })

  it('retains original amounts without execution data', () => {
    expect(getRecreatedOrderAmounts(buildOrder({ apiAdditionalInfo: undefined }))).toEqual({
      inputCurrencyAmount: '1100',
      outputCurrencyAmount: '2000',
    })
  })

  it('treats missing fees as zero', () => {
    expect(getRecreatedOrderAmounts(buildOrder({ feeAmount: undefined }, { executedFeeAmount: undefined }))).toEqual({
      inputCurrencyAmount: '560',
      outputCurrencyAmount: '1120',
    })
  })

  it('rounds minimum sell-order proceeds up', () => {
    const order = buildOrder(
      { sellAmount: '3', buyAmount: '10', feeAmount: '0' },
      { executedSellAmount: '1', executedFeeAmount: '0' },
    )
    expect(getRecreatedOrderAmounts(order)).toEqual({
      inputCurrencyAmount: '2',
      outputCurrencyAmount: '7',
    })
  })

  it('rounds maximum buy-order spend down', () => {
    const order = buildOrder(
      { kind: OrderKind.BUY, sellAmount: '10', buyAmount: '3', feeAmount: '0' },
      {
        executedBuyAmount: '1',
      },
    )
    expect(getRecreatedOrderAmounts(order)).toEqual({
      inputCurrencyAmount: '6',
      outputCurrencyAmount: '2',
    })
  })

  it.each(['1040', '2000'])('clamps filled volume %s to a zero remainder', (executedSellAmount) => {
    expect(getRecreatedOrderAmounts(buildOrder({}, { executedSellAmount }))).toEqual({
      inputCurrencyAmount: '0',
      outputCurrencyAmount: '0',
    })
  })

  it('preserves precision beyond Number.MAX_SAFE_INTEGER', () => {
    const order = buildOrder(
      { sellAmount: '1000000000000000003', buyAmount: '2000000000000000006', feeAmount: '0' },
      { executedSellAmount: '1', executedFeeAmount: '0' },
    )
    expect(getRecreatedOrderAmounts(order)).toEqual({
      inputCurrencyAmount: '1000000000000000002',
      outputCurrencyAmount: '2000000000000000004',
    })
  })
})
