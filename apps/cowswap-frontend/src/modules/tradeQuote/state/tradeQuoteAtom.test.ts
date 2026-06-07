import { createStore } from 'jotai'

import { PriceQuality, QuoteAndPost } from '@cowprotocol/cow-sdk'

import { hasFreshOptimalQuote } from '../utils/hasFreshOptimalQuote'

import { tradeQuotesAtom, updateTradeQuoteAtom } from './tradeQuoteAtom'

const SELL_TOKEN = '0x1111111111111111111111111111111111111111'
const MOCK_QUOTE = {} as QuoteAndPost

describe('updateTradeQuoteAtom', () => {
  it('preserves the existing quote timestamp during same-parameter loading updates', () => {
    const store = createStore()

    store.set(updateTradeQuoteAtom, SELL_TOKEN, {
      quote: MOCK_QUOTE,
      fetchParams: {
        hasParamsChanged: false,
        priceQuality: PriceQuality.OPTIMAL,
        fetchStartTimestamp: 1,
      },
      localQuoteTimestamp: 123,
      isLoading: false,
    })

    store.set(updateTradeQuoteAtom, SELL_TOKEN, {
      isLoading: true,
      hasParamsChanged: false,
    })

    expect(store.get(tradeQuotesAtom)[SELL_TOKEN]?.localQuoteTimestamp).toBe(123)
  })

  it('respects explicit quote invalidation when parameters change', () => {
    const store = createStore()

    store.set(updateTradeQuoteAtom, SELL_TOKEN, {
      quote: MOCK_QUOTE,
      fetchParams: {
        hasParamsChanged: false,
        priceQuality: PriceQuality.OPTIMAL,
        fetchStartTimestamp: 1,
      },
      localQuoteTimestamp: 123,
      isLoading: false,
    })

    store.set(updateTradeQuoteAtom, SELL_TOKEN, {
      quote: null,
      bridgeQuote: null,
      fetchParams: null,
      isLoading: true,
      hasParamsChanged: true,
      localQuoteTimestamp: null,
    })

    const state = store.get(tradeQuotesAtom)[SELL_TOKEN]

    expect(state?.quote).toBeNull()
    expect(state?.fetchParams).toBeNull()
    expect(state?.localQuoteTimestamp).toBeNull()
    expect(state?.hasParamsChanged).toBe(true)
  })

  it('does not treat a preserved fast quote as fresh optimal after an optimal request fails', () => {
    const store = createStore()

    store.set(updateTradeQuoteAtom, SELL_TOKEN, {
      quote: MOCK_QUOTE,
      fetchParams: {
        hasParamsChanged: false,
        priceQuality: PriceQuality.FAST,
        fetchStartTimestamp: 1,
      },
      isLoading: true,
    })

    store.set(updateTradeQuoteAtom, SELL_TOKEN, {
      error: new Error('Optimal quote failed'),
      fetchParams: {
        hasParamsChanged: false,
        priceQuality: PriceQuality.OPTIMAL,
        fetchStartTimestamp: 1,
      },
      isLoading: false,
      hasParamsChanged: false,
    })

    const state = store.get(tradeQuotesAtom)[SELL_TOKEN]

    expect(state?.quote).toBe(MOCK_QUOTE)
    expect(state?.fetchParams?.priceQuality).toBe(PriceQuality.OPTIMAL)
    expect(hasFreshOptimalQuote(state!)).toBe(false)
  })

  it('keeps a fresh optimal quote active when the same-cycle fast request fails later', () => {
    const store = createStore()

    store.set(updateTradeQuoteAtom, SELL_TOKEN, {
      quote: MOCK_QUOTE,
      fetchParams: {
        hasParamsChanged: false,
        priceQuality: PriceQuality.OPTIMAL,
        fetchStartTimestamp: 1,
      },
      isLoading: false,
      error: null,
    })

    store.set(updateTradeQuoteAtom, SELL_TOKEN, {
      error: new Error('Fast quote failed'),
      fetchParams: {
        hasParamsChanged: false,
        priceQuality: PriceQuality.FAST,
        fetchStartTimestamp: 1,
      },
      isLoading: false,
      hasParamsChanged: false,
    })

    const state = store.get(tradeQuotesAtom)[SELL_TOKEN]

    expect(state?.quote).toBe(MOCK_QUOTE)
    expect(state?.error).toBeNull()
    expect(state?.fetchParams?.priceQuality).toBe(PriceQuality.OPTIMAL)
    expect(hasFreshOptimalQuote(state!)).toBe(true)
  })
})
