import { createReducer, PayloadAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { updateQuote, setQuoteError, getNewQuoteStart, refreshQuoteStart, QuoteError } from './actions'
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

export default createReducer(initialState, builder =>
  builder
    /**
     * Gets a new quote
     */
    .addCase(getNewQuoteStart, (state, action) => {
      initializeState(state.quotes, action)
      const quoteData = action.payload

      // Activate loader
      state.loading = true

      // Reset price old price, if necessary
      const quotesState = state.quotes[quoteData.chainId][quoteData.sellToken]
      if (quotesState?.price) {
        quotesState.price.amount = null
      }
    })

    /**
     * Refresh quote
     */
    .addCase(refreshQuoteStart, state => {
      // Activates loader
      state.loading = true
    })

    /**
     * Update the price setting a new one
     */
    .addCase(updateQuote, (state, action) => {
      const quotes = state.quotes
      const { sellToken, chainId } = action.payload
      initializeState(quotes, action)

      // Updates the new price
      quotes[chainId][sellToken] = { ...action.payload, lastCheck: Date.now() }
      state.loading = false
    })

    /**
     * Signal there was an error getting a quote
     */
    .addCase(setQuoteError, (state, action) => {
      const quotes = state.quotes
      const payload = action.payload
      const { sellToken, chainId } = payload
      initializeState(quotes, action)

      // Sets the error information
      quotes[chainId][sellToken] = { ...payload, lastCheck: Date.now() }
      state.loading = false
    })
)
