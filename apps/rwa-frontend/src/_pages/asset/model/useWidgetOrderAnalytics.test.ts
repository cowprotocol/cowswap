import { OrderKind } from '@cowprotocol/cow-sdk'
import { CowWidgetEvents, type OnPostedOrderPayload } from '@cowprotocol/events'

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

  it('sends a posted order of an asset token as a buy of the asset', () => {
    const { result } = renderHook(() => useWidgetOrderAnalytics(ASSET))
    const listener = result.current.find(({ event }) => event === CowWidgetEvents.ON_POSTED_ORDER)

    listener?.handler(POSTED_ORDER as never)

    expect(window.dataLayer).toEqual([
      expect.objectContaining({
        event: 'order_submitted',
        ticker: 'AAPL',
        side: 'buy',
        orderId: '0xorder',
        chainId: 1,
        orderType: 'SWAP',
        kind: OrderKind.SELL,
        sellTokenSymbol: 'USDC',
        buyTokenSymbol: 'AAPLx',
        sellAmountUnits: '1000',
        buyAmountUnits: '4',
      }),
    ])
  })
})
