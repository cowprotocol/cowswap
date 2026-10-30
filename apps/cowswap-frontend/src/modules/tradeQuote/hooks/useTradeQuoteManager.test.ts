import { getDefaultStore } from 'jotai'

import { OrderKind, PriceQuality, SupportedChainId } from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { act, renderHook } from '@testing-library/react'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

import { useTradeQuoteManager } from './useTradeQuoteManager'

import { TradeQuoteState, tradeQuotesAtom } from '../state/tradeQuoteAtom'
import { TradeQuoteFetchParams } from '../types'
import { getAreAllQuotesReceived, getIsSameTradeQuoteRefreshing } from '../utils/getAreAllQuotesReceived'

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
  priceQuality: PriceQuality.VERIFIED,
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

    act(() => manager.setLoading(fetchParams, baseParams))
    act(() => manager.onError(liquidityError, SupportedChainId.MAINNET, baseParams, fetchParams))
    expect(getError()).toBe(liquidityError)

    // Smart slippage recompute changes only the slippage param. This must NOT clear the
    // error, otherwise slippage would recompute again and re-trigger an endless blink.
    act(() => manager.setLoading(fetchParams, makeParams({ swapSlippageBps: 75 })))
    expect(getError()).toBe(liquidityError)
  })

  it('clears the error when the buy token changes (stale error fix)', () => {
    const manager = renderManager()
    const baseParams = makeParams()

    act(() => manager.setLoading(fetchParams, baseParams))
    act(() => manager.onError(liquidityError, SupportedChainId.MAINNET, baseParams, fetchParams))
    expect(getError()).toBe(liquidityError)

    act(() => manager.setLoading(fetchParams, makeParams({ buyTokenAddress: DAI })))
    expect(getError()).toBeNull()
  })

  it('clears the error when the amount changes', () => {
    const manager = renderManager()
    const baseParams = makeParams()

    act(() => manager.setLoading(fetchParams, baseParams))
    act(() => manager.onError(liquidityError, SupportedChainId.MAINNET, baseParams, fetchParams))
    expect(getError()).toBe(liquidityError)

    act(() => manager.setLoading(fetchParams, makeParams({ amount: 2_000_000n })))
    expect(getError()).toBeNull()
  })

  it('stores the quote params the error was returned for', () => {
    const manager = renderManager()
    const baseParams = makeParams()

    act(() => manager.setLoading(fetchParams, baseParams))
    act(() => manager.onError(liquidityError, SupportedChainId.MAINNET, baseParams, fetchParams))

    expect(Object.values(store.get(tradeQuotesAtom))[0]?.errorQuoteParams).toBe(baseParams)
  })
})

describe('useTradeQuoteManager - retained quote', () => {
  const quote = { quoteResults: {} } as unknown as NonNullable<TradeQuoteState['quote']>

  function getQuote(): TradeQuoteState['quote'] | undefined {
    return Object.values(store.get(tradeQuotesAtom))[0]?.quote
  }

  it('keeps the previous quote while a same-chain requote loads', () => {
    const manager = renderManager()
    const baseParams = makeParams()

    act(() => manager.setLoading(fetchParams, baseParams))
    act(() => manager.onResponse(quote, null, fetchParams, baseParams))
    act(() => manager.setLoading(fetchParams, makeParams({ amount: 2_000_000n })))

    expect(getQuote()).toBe(quote)
  })

  it('drops the previous quote when the sell chain changes', () => {
    const manager = renderManager()
    const baseParams = makeParams()

    act(() => manager.setLoading(fetchParams, baseParams))
    act(() => manager.onResponse(quote, null, fetchParams, baseParams))
    act(() =>
      manager.setLoading(
        fetchParams,
        makeParams({ sellTokenChainId: SupportedChainId.ARBITRUM_ONE, buyTokenChainId: SupportedChainId.ARBITRUM_ONE }),
      ),
    )

    expect(getQuote()).toBeNull()
  })

  it('drops the previous quote when the buy chain changes', () => {
    const manager = renderManager()
    const baseParams = makeParams()

    act(() => manager.setLoading(fetchParams, baseParams))
    act(() => manager.onResponse(quote, null, fetchParams, baseParams))
    act(() => manager.setLoading(fetchParams, makeParams({ buyTokenChainId: SupportedChainId.BASE })))

    expect(getQuote()).toBeNull()
  })
})

describe('useTradeQuoteManager - all quotes received', () => {
  const quote = { quoteResults: {} } as unknown as NonNullable<TradeQuoteState['quote']>
  const fastParams: TradeQuoteFetchParams = { ...fetchParams, priceQuality: PriceQuality.FAST }

  function getState(): TradeQuoteState {
    const state = Object.values(store.get(tradeQuotesAtom))[0]
    if (!state) throw new Error('no quote state')
    return state
  }

  function startRound(manager: ReturnType<typeof renderManager>, params: QuoteBridgeRequest): void {
    act(() => manager.setLoading(fastParams, params))
    act(() => manager.setLoading(fetchParams, params))
  }

  it('waits for the fast quote even when the verified one arrives first', () => {
    const manager = renderManager()
    const params = makeParams()

    startRound(manager, params)
    act(() => manager.onResponse(quote, null, fetchParams, params))
    expect(getAreAllQuotesReceived(getState())).toBe(false)

    act(() => manager.onResponse(quote, null, fastParams, params))
    expect(getAreAllQuotesReceived(getState())).toBe(true)
  })

  it('counts a failed quote as received', () => {
    const manager = renderManager()
    const params = makeParams()

    startRound(manager, params)
    act(() => manager.onError(liquidityError, SupportedChainId.MAINNET, params, fastParams))
    act(() => manager.onResponse(quote, null, fetchParams, params))

    expect(getAreAllQuotesReceived(getState())).toBe(true)
  })

  it('ignores responses from a previous fetch round', () => {
    const manager = renderManager()
    const params = makeParams()
    const nextRoundParams: TradeQuoteFetchParams = { ...fetchParams, fetchStartTimestamp: 2 }

    startRound(manager, params)
    act(() => manager.setLoading(nextRoundParams, params))
    act(() => manager.onResponse(quote, null, fastParams, params))
    act(() => manager.onResponse(quote, null, fetchParams, params))

    expect(getAreAllQuotesReceived(getState())).toBe(false)

    act(() => manager.onResponse(quote, null, nextRoundParams, params))
    expect(getAreAllQuotesReceived(getState())).toBe(true)
  })

  it('counts a cancelled quote as received', () => {
    const manager = renderManager()
    const params = makeParams()

    startRound(manager, params)
    act(() => manager.onSettled(fastParams))
    act(() => manager.onSettled(fetchParams))

    expect(getAreAllQuotesReceived(getState())).toBe(true)
  })

  it('ignores a cancelled quote from a previous fetch round', () => {
    const manager = renderManager()
    const params = makeParams()
    const nextRoundParams: TradeQuoteFetchParams = { ...fetchParams, fetchStartTimestamp: 2 }

    startRound(manager, params)
    act(() => manager.setLoading(nextRoundParams, params))
    act(() => manager.onSettled(fetchParams))

    expect(getAreAllQuotesReceived(getState())).toBe(false)
  })

  it('keeps a params change visible on the round after the fast quote arrives', () => {
    const manager = renderManager()
    const params = makeParams()

    startRound(manager, params)
    act(() => manager.onResponse(quote, null, fastParams, params))

    expect(getState().hasParamsChanged).toBe(false)
    expect(getIsSameTradeQuoteRefreshing(getState())).toBe(false)
  })

  it('treats a polling round of the same trade as refreshing', () => {
    const manager = renderManager()
    const params = makeParams()
    const pollingParams: TradeQuoteFetchParams = { ...fetchParams, hasParamsChanged: false, fetchStartTimestamp: 2 }

    startRound(manager, params)
    act(() => manager.onResponse(quote, null, fetchParams, params))
    act(() => manager.onResponse(quote, null, fastParams, params))
    act(() => manager.setLoading(pollingParams, params))

    expect(getIsSameTradeQuoteRefreshing(getState())).toBe(true)
  })

  it('clears pending quotes on reset', () => {
    const manager = renderManager()

    startRound(manager, makeParams())
    act(() => manager.reset())

    expect(getAreAllQuotesReceived(getState())).toBe(true)
  })
})

describe('useTradeQuoteManager - final quote flag', () => {
  const quote = { quoteResults: {} } as unknown as NonNullable<TradeQuoteState['quote']>
  const nextRoundFastParams: TradeQuoteFetchParams = {
    ...fetchParams,
    priceQuality: PriceQuality.FAST,
    fetchStartTimestamp: 2,
  }

  function getHasFinalQuote(): boolean | undefined {
    return Object.values(store.get(tradeQuotesAtom))[0]?.hasFinalQuote
  }

  it('stays set when a fast quote of a later round follows the final one', () => {
    const manager = renderManager()
    const params = makeParams()

    act(() => manager.setLoading(fetchParams, params))
    act(() => manager.onResponse(quote, null, fetchParams, params))
    expect(getHasFinalQuote()).toBe(true)

    act(() => manager.setLoading(nextRoundFastParams, params))
    act(() => manager.onResponse(quote, null, nextRoundFastParams, params))
    expect(getHasFinalQuote()).toBe(true)
  })

  it('is not set by a fast quote alone', () => {
    const manager = renderManager()
    const params = makeParams()

    act(() => manager.setLoading(nextRoundFastParams, params))
    act(() => manager.onResponse(quote, null, nextRoundFastParams, params))

    expect(getHasFinalQuote()).toBe(false)
  })

  it('clears on reset', () => {
    const manager = renderManager()
    const params = makeParams()

    act(() => manager.setLoading(fetchParams, params))
    act(() => manager.onResponse(quote, null, fetchParams, params))
    act(() => manager.reset())

    expect(getHasFinalQuote()).toBe(false)
  })
})
