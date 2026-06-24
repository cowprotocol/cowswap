import { getDefaultStore } from 'jotai'

import { OrderKind, PriceQuality, SupportedChainId } from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { act, renderHook } from '@testing-library/react'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

import { useTradeQuoteManager } from './useTradeQuoteManager'

import { TradeQuoteState, tradeQuotesAtom } from '../state/tradeQuoteAtom'
import { TradeQuoteFetchParams } from '../types'

// Avoid pulling token entities / wallet deps into this unit test.
jest.mock('./useProcessUnsupportedTokenError', () => ({
  useProcessUnsupportedTokenError: () => jest.fn(),
}))

const SELL_TOKEN = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // WETH
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f'

const store = getDefaultStore()

function makeParams(overrides: Partial<QuoteBridgeRequest> = {}): QuoteBridgeRequest {
  return {
    kind: OrderKind.SELL,
    amount: 1_000_000n,
    sellTokenChainId: SupportedChainId.MAINNET,
    sellTokenAddress: SELL_TOKEN,
    buyTokenChainId: SupportedChainId.MAINNET,
    buyTokenAddress: USDC,
    swapSlippageBps: 50,
    ...overrides,
  } as unknown as QuoteBridgeRequest
}

const fetchParams: TradeQuoteFetchParams = {
  hasParamsChanged: true,
  priceQuality: PriceQuality.OPTIMAL,
  fetchStartTimestamp: 1,
}

const liquidityError = new QuoteApiError({
  errorType: QuoteApiErrorCodes.InsufficientLiquidity,
  description: 'Insufficient liquidity',
})

function getError(): TradeQuoteState['error'] | undefined {
  return Object.values(store.get(tradeQuotesAtom))[0]?.error
}

function renderManager(): NonNullable<ReturnType<typeof useTradeQuoteManager>> {
  store.set(tradeQuotesAtom, {})
  const { result } = renderHook(() => useTradeQuoteManager(SELL_TOKEN))
  if (!result.current) throw new Error('manager not created')
  return result.current
}

describe('useTradeQuoteManager - stale error clearing', () => {
  it('keeps the error on a slippage-only params change (prevents the flicker loop)', () => {
    const manager = renderManager()
    const baseParams = makeParams()

    act(() => manager.setLoading(true, baseParams))
    act(() => manager.onError(liquidityError, SupportedChainId.MAINNET, baseParams, fetchParams))
    expect(getError()).toBe(liquidityError)

    // Smart slippage recompute changes only the slippage param. This must NOT clear the
    // error, otherwise slippage would recompute again and re-trigger an endless blink.
    act(() => manager.setLoading(true, makeParams({ swapSlippageBps: 75 })))
    expect(getError()).toBe(liquidityError)
  })

  it('clears the error when the buy token changes (stale error fix)', () => {
    const manager = renderManager()
    const baseParams = makeParams()

    act(() => manager.setLoading(true, baseParams))
    act(() => manager.onError(liquidityError, SupportedChainId.MAINNET, baseParams, fetchParams))
    expect(getError()).toBe(liquidityError)

    act(() => manager.setLoading(true, makeParams({ buyTokenAddress: DAI })))
    expect(getError()).toBeNull()
  })

  it('clears the error when the amount changes', () => {
    const manager = renderManager()
    const baseParams = makeParams()

    act(() => manager.setLoading(true, baseParams))
    act(() => manager.onError(liquidityError, SupportedChainId.MAINNET, baseParams, fetchParams))
    expect(getError()).toBe(liquidityError)

    act(() => manager.setLoading(true, makeParams({ amount: 2_000_000n })))
    expect(getError()).toBeNull()
  })
})
