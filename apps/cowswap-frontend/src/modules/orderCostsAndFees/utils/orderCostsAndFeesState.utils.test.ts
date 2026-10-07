import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { getOrderCostsAndFeesState } from './orderCostsAndFeesState.utils'

import { OrderTradesSnapshot } from '../types/orderCostsAndFees.types'

const WETH = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether')
const USDC = new Token(1, '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6, 'USDC', 'USD Coin')

// Sell WETH for USDC; the current order data has seen a newer fill than the snapshot.
const ORDER = {
  id: 'order-a',
  kind: OrderKind.SELL,
  inputToken: WETH,
  outputToken: USDC,
  fullAppData: undefined,
  executionData: { gasCost: '999', executedSellAmount: 1n, executedBuyAmount: 1n },
} as unknown as ParsedOrder

const SNAPSHOT: OrderTradesSnapshot = {
  orderId: 'order-a',
  gasCost: 10n ** 15n,
  executedSellAmount: 10n ** 18n,
  executedBuyAmount: 2500n * 10n ** 6n,
  trades: [
    {
      executedProtocolFees: [
        { amount: '1000000000000000', token: WETH.address, policy: { volume: { factor: 0.001 } } },
      ],
    },
  ],
}

const BASE = {
  order: ORDER,
  chainId: SupportedChainId.MAINNET,
  snapshot: SNAPSHOT,
  error: undefined,
  nativePrice: null,
}

describe('getOrderCostsAndFeesState()', () => {
  it('is loading while only another order’s trades are available', () => {
    expect(getOrderCostsAndFeesState({ ...BASE, snapshot: { ...SNAPSHOT, orderId: 'order-b' } })).toEqual({
      status: 'loading',
    })
  })

  it('is unavailable when the fetch for this order failed and only another order’s trades are available', () => {
    expect(
      getOrderCostsAndFeesState({ ...BASE, snapshot: { ...SNAPSHOT, orderId: 'order-b' }, error: new Error('x') }),
    ).toEqual({ status: 'unavailable' })
  })

  it('builds the costs from the snapshot, not from the current order execution data', () => {
    const state = getOrderCostsAndFeesState(BASE)

    if (state.status !== 'ready') throw new Error(`expected ready, got ${state.status}`)
    expect(state.costs.lineItems.map(({ amount }) => amount)).toEqual([10n ** 15n, 10n ** 15n])
    expect(state.costs.surplusCosts).toBeUndefined()

    const withPrice = getOrderCostsAndFeesState({ ...BASE, nativePrice: 4e8 })
    if (withPrice.status !== 'ready') throw new Error(`expected ready, got ${withPrice.status}`)
    expect(withPrice.costs.surplusCosts?.items.map(({ amount }) => amount)).toEqual([2_500_000n, 2_500_000n])
  })

  it('is loading while the native price loads', () => {
    expect(getOrderCostsAndFeesState({ ...BASE, nativePrice: undefined })).toEqual({ status: 'loading' })
  })

  it('is unavailable when the order has no trades', () => {
    expect(getOrderCostsAndFeesState({ ...BASE, snapshot: { ...SNAPSHOT, trades: [] } })).toEqual({
      status: 'unavailable',
    })
  })
})
