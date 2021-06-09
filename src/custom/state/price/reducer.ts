import { createReducer, PayloadAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { updateQuote, clearQuote, setQuoteError, setLoadingQuote } from './actions'
import { Writable } from 'custom/types'
import { PrefillStateRequired } from '../orders/reducer'
import { FeeQuoteParams } from 'utils/operator'
import { ApiErrorCodes } from 'utils/operator/error'

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
  error?: ApiErrorCodes
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
    .addCase(setQuoteError, ({ quotes: state }, action) => {
      initializeState(state, action)
      const { sellToken, chainId } = action.payload
      state[chainId][sellToken] = action.payload
    })
    .addCase(setLoadingQuote, (state, action) => {
      state.loading = action.payload
    })
    .addCase(updateQuote, ({ quotes: state }, action) => {
      initializeState(state, action)
      const { sellToken, chainId } = action.payload
      state[chainId][sellToken] = action.payload
    })
    .addCase(clearQuote, ({ quotes: state }, action) => {
      initializeState(state, action)
      const { token, chainId } = action.payload
      delete state[chainId][token]
    })
)
