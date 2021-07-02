import { createReducer, PayloadAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { updateQuote, setQuoteError, getNewQuote, refreshQuote, QuoteError } from './actions'
import { Writable } from 'custom/types'
import { PrefillStateRequired } from '../orders/reducer'
import { FeeQuoteParams } from 'utils/operator'

// API Doc: https://protocol-rinkeby.dev.gnosisdev.com/api

export const EMPTY_FEE = {
  feeAsCurrency: undefined,
  amount: '0'
}

export interface FeeInformation {
  expirationDate: string
  amount: string
}

export interface PriceInformation {
  token: string
  amount: string | null
}

export interface QuoteInformationObject extends FeeQuoteParams {
  fee?: FeeInformation
  price?: PriceInformation
  error?: QuoteError
  lastCheck: number
}

// Map token addresses to their last quote information
export type QuotesMap = Record<string, QuoteInformationObject>

export type QuoteInformationState = {
  readonly [chainId in ChainId]?: Partial<QuotesMap>
}

type InitialState = { loading: boolean; quotes: QuoteInformationState }

const initialState: InitialState = { loading: false, quotes: {} }

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

function getResetPrice(sellToken: string, buyToken: string, kind: string) {
  return {
    amount: null,
    token: kind ? sellToken : buyToken
  }
}

export default createReducer(initialState, builder =>
  builder
    /**
     * Gets a new quote
     */
    .addCase(getNewQuote, (state, action) => {
      const quoteData = action.payload
      const { sellToken, buyToken, fromDecimals, toDecimals, amount, chainId, kind } = quoteData
      initializeState(state.quotes, action)

      // Reset quote params
      const quotes = state.quotes[quoteData.chainId]
      quotes[sellToken] = {
        sellToken,
        buyToken,
        fromDecimals,
        toDecimals,
        amount,
        chainId,
        kind,
        // Update last checked price
        lastCheck: Date.now(),
        // Reset price
        price: getResetPrice(sellToken, buyToken, kind)
      }

      // Activate loader
      state.loading = true
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
          lastCheck: Date.now()
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
      const { sellToken, chainId } = payload
      initializeState(quotes, action)

      // Updates the new price
      const quoteInformation = quotes[chainId][sellToken]
      if (quoteInformation) {
        quotes[chainId][sellToken] = { ...quoteInformation, ...payload }
      }

      // Stop the loader
      state.loading = false
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
      const quoteInformation = quotes[chainId][sellToken]
      if (quoteInformation) {
        quotes[chainId][sellToken] = {
          ...quoteInformation,
          ...payload,
          price: getResetPrice(sellToken, buyToken, kind)
        }
      }

      // Stop the loader
      state.loading = false
    })
)
