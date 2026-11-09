import { mapPostedOrder } from '@cowprotocol/analytics/order-lifecycle'
import { OrderKind } from '@cowprotocol/cow-sdk'
import {
  type CowWidgetEventListeners,
  CowWidgetEvents,
  type OnFulfilledOrderPayload,
  type OnPostedOrderPayload,
} from '@cowprotocol/events'

import { renderHook } from '@testing-library/react'

import { useWidgetOrderAnalytics } from './useWidgetOrderAnalytics'

import { AAPLX_MAINNET } from '../lib/fixtures'

import { type RwaAsset } from '@/entities/asset'

const ASSET: RwaAsset = {
  ticker: 'AAPL',
  coingeckoId: 'apple',
  title: 'Apple',
  type: 'stock',
  priority: 0,
  tokens: [AAPLX_MAINNET],
}

const USDC = {
  chainId: 1,
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
}

const USDC_BASE = { ...USDC, chainId: 8453, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' }
const TSLAX_MAINNET = '0x8aD3c73F833d3F9A523aB01476625F269aEB7Cf0'

const POSTED_ORDER: OnPostedOrderPayload = {
  orderUid: '0xorder',
  chainId: 1,
  owner: '0x1111111111111111111111111111111111111111',
  kind: OrderKind.SELL,
  orderType: 'SWAP' as OnPostedOrderPayload['orderType'],
  inputAmount: BigInt(1_000_000_000),
  outputAmount: BigInt('4000000000000000000'),
  inputToken: USDC,
  outputToken: { ...AAPLX_MAINNET, address: '0x9d275685dc284c8eb1c79f6aba7a63dc75ec890a' },
}

describe('useWidgetOrderAnalytics', () => {
  beforeEach(() => {
    window.dataLayer = []
  })

  it('sends a posted order paid with an asset token as a sell', () => {
    emit(CowWidgetEvents.ON_POSTED_ORDER, { ...POSTED_ORDER, inputToken: AAPLX_MAINNET, outputToken: USDC })

    expect(window.dataLayer?.[0]).toMatchObject({ event: 'order_submitted', ticker: 'AAPL', side: 'sell' })
  })

  it('sends a bridged buy as a buy when the bought token has no match on the source chain', () => {
    emit(CowWidgetEvents.ON_POSTED_ORDER, {
      ...POSTED_ORDER,
      chainId: 8453,
      isCrossChain: true,
      destinationChainId: 1,
      inputToken: USDC_BASE,
      outputToken: AAPLX_MAINNET,
    })

    expect(window.dataLayer?.[0]).toMatchObject({ event: 'order_submitted', ticker: 'AAPL', side: 'buy' })
  })

  it('sends the asset ticker for a fulfilled order of an asset token', () => {
    emit(CowWidgetEvents.ON_FULFILLED_ORDER, fulfilledOrder(USDC.address, AAPLX_MAINNET.address))

    expect(window.dataLayer?.[0]).toMatchObject({ event: 'swap_executed', ticker: 'AAPL' })
  })

  it('sends the asset ticker for a fulfilled bridged order whose bridge output is an asset token', () => {
    const bridgeOrder = {
      quoteAmounts: { bridgeMinReceiveAmount: { token: AAPLX_MAINNET, amount: '1' } },
    } as unknown as OnFulfilledOrderPayload['bridgeOrder']

    emit(CowWidgetEvents.ON_FULFILLED_ORDER, {
      ...fulfilledOrder(USDC_BASE.address, USDC_BASE.address, bridgeOrder),
      chainId: 8453,
    })

    expect(window.dataLayer?.[0]).toMatchObject({ event: 'swap_executed', ticker: 'AAPL' })
  })

  it('sends a null ticker for an order outcome of another asset', () => {
    emit(CowWidgetEvents.ON_FULFILLED_ORDER, fulfilledOrder(USDC.address, TSLAX_MAINNET))
    emit(CowWidgetEvents.ON_CANCELLED_ORDER, fulfilledOrder(USDC.address, TSLAX_MAINNET))
    emit(CowWidgetEvents.ON_EXPIRED_ORDER, fulfilledOrder(USDC.address, TSLAX_MAINNET))

    expect(window.dataLayer).toEqual([
      expect.objectContaining({ event: 'swap_executed', ticker: null }),
      expect.objectContaining({ event: 'swap_cancelled', ticker: null }),
      expect.objectContaining({ event: 'swap_expired', ticker: null }),
    ])
  })

  it('sends a posted order of an asset token as a buy of the asset', () => {
    const { result } = renderHook(() => useWidgetOrderAnalytics(ASSET))
    const listener = result.current.find(({ event }) => event === CowWidgetEvents.ON_POSTED_ORDER)

    listener?.handler(POSTED_ORDER as never)

    expect(window.dataLayer).toEqual([
      expect.objectContaining({
        ...withoutUndefined(mapPostedOrder(POSTED_ORDER)),
        event: 'order_submitted',
        ticker: 'AAPL',
        side: 'buy',
      }),
    ])
    expect(window.dataLayer?.[0]).toMatchObject({
      chainId: '1',
      sellAmountUnits: '1000',
      buyAmountUnits: '4',
      fromCurrency: 'USDC',
      toCurrency: 'AAPLx',
      fromAmount: '1000',
      toAmount: '4',
    })
  })
})

function emit(event: CowWidgetEvents, payload: unknown): void {
  const { result } = renderHook(() => useWidgetOrderAnalytics(ASSET))
  const listeners: CowWidgetEventListeners = result.current

  listeners.find((listener) => listener.event === event)?.handler(payload as never)
}

function fulfilledOrder(
  sellToken: string,
  buyToken: string,
  bridgeOrder?: OnFulfilledOrderPayload['bridgeOrder'],
): OnFulfilledOrderPayload {
  return {
    chainId: 1,
    orderType: 'SWAP' as OnFulfilledOrderPayload['orderType'],
    order: { uid: '0xorder', owner: POSTED_ORDER.owner, sellToken, buyToken } as OnFulfilledOrderPayload['order'],
    bridgeOrder,
  }
}

function withoutUndefined(payload: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined))
}
