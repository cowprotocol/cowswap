import { isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { createReducer, current, PayloadAction } from '@reduxjs/toolkit'
import { FeeInformation, PriceInformation } from 'types'

import { getNewQuote, QuoteError, refreshQuote, setQuoteError, updateQuote } from './actions'
import { LegacyFeeQuoteParams } from './types'

import { PrefillStateRequired } from '../orders/reducer'

// API Doc: https://protocol-rinkeby.dev.gnosisdev.com/api

type Writable<T> = {
  -readonly [K in keyof T]: T[K]
}

export const EMPTY_FEE = {
  feeAsCurrency: undefined,
  amount: '0',
}

export interface QuoteInformationObject extends LegacyFeeQuoteParams {
  fee?: FeeInformation
  price?: PriceInformation
  error?: QuoteError
  lastCheck: number
  localQuoteTimestamp?: number
  quoteValidTo?: number
}

// Map token addresses to their last quote information
export type QuotesMap = Record<string, QuoteInformationObject>

export type QuoteInformationState = {
  readonly [chainId in ChainId]?: Partial<QuotesMap>
}

type InitialState = {
  loading: boolean
  loadingBestQuote: boolean
  quotes: QuoteInformationState
  initialQuoteLoaded: boolean
}

const initialState: InitialState = { initialQuoteLoaded: false, loadingBestQuote: false, loading: false, quotes: {} }

// Makes sure there stat is initialized
function initializeState(
  state: Writable<QuoteInformationState>,
  { payload: { chainId } }: PayloadAction<PrefillStateRequired>
): asserts state is Required<QuoteInformationState> {
  // Makes sure there stat is initialized
  const stateAtChainId = state[chainId]
  if (!stateAtChainId) {
    state[chainId] = {}
    return
  }
}

function getResetPrice(sellToken: string, buyToken: string, kind: OrderKind) {
  return {
    amount: null,
    // When we buy, the price estimation is given in sell tokens (if we sell, we give it in sell tokens)
    // The price estimation is given in:
    //    - sell tokens (for buy orders)
    //    - buy tokens (for sell orders)
    token: isSellOrder(kind) ? buyToken : sellToken,
  }
}

export default createReducer(initialState, (builder) =>
  builder
    /**
     * Gets a new quote
     */
    .addCase(getNewQuote, (state, action) => {
      const quoteData = action.payload
      const { sellToken, buyToken, chainId, kind, ...rest } = quoteData
      initializeState(state.quotes, action)

      // Reset quote params
      const quotes = state.quotes[quoteData.chainId]
      quotes[sellToken] = {
        ...rest,
        sellToken,
        buyToken,
        chainId,
        kind,
        // Update last checked price
        lastCheck: Date.now(),
        // Reset price
        price: getResetPrice(sellToken, buyToken, kind),
      }

      // Activate loaders
      state.loading = true
      state.loadingBestQuote = true
    })

    /**
     * Refresh quote
     */
    .addCase(refreshQuote, (state, action) => {
      const quoteData = action.payload
      const { sellToken, chainId } = quoteData
      initializeState(state.quotes, action)

      // Update Quote info
      const quotes = state.quotes[chainId]
      const quoteInfo = quotes[sellToken]
      if (quoteInfo) {
        quotes[sellToken] = {
          ...quoteInfo,
          // Update last checked price
          lastCheck: Date.now(),
        }
      }

      // Activates loader
      state.loading = true
    })

    /**
     * Update the price setting a new one
     */
    .addCase(updateQuote, (state, action) => {
      const quotes = state.quotes
      const payload = action.payload
      const { sellToken, chainId, isBestQuote } = payload
      initializeState(quotes, action)

      // Updates the new price
      const quoteInformation = quotes[chainId][sellToken]
      const quote = current(state).quotes[chainId]

      // Flag to not update the quote when the there is already a quote price and the
      // current quote in action is not the best quote, meaning the best quote for
      // some reason was already loaded before fast quote and we want to keep best quote data
      const hasPrice = !!quote && !!quote[sellToken]?.price?.amount
      const shouldUpdate = !(!isBestQuote && hasPrice)

      if (quoteInformation && shouldUpdate) {
        quotes[chainId][sellToken] = {
          ...quoteInformation,
          ...payload,
          localQuoteTimestamp: Math.ceil(Date.now() / 1000),
        }
      }

      // Stop the loader
      state.loading = false

      // Mark that the first quote is loaded
      state.initialQuoteLoaded = true

      // Stop the quote loader when the "best" quote is fetched
      if (isBestQuote) {
        state.loadingBestQuote = false
      }
    })

    /**
     * Signal there was an error getting a quote
     */
    .addCase(setQuoteError, (state, action) => {
      const quotes = state.quotes
      const payload = action.payload
      const { sellToken, buyToken, kind, chainId } = payload
      initializeState(quotes, action)

      // Sets the error information
      const quoteInformation = quotes[chainId][sellToken] || {}
      quotes[chainId][sellToken] = {
        ...quoteInformation,
        ...payload,
        price: getResetPrice(sellToken, buyToken, kind),
        lastCheck: Date.now(),
      }

      // Stop the loaders
      state.loading = false
      state.loadingBestQuote = false
    })
)
