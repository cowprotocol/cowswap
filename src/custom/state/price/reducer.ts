import { createReducer, PayloadAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { updateQuote, clearQuote } from './actions'
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
  amount: string
}

export interface QuoteInformationObject extends Omit<FeeQuoteParams, 'kind'> {
  fee?: FeeInformation
  price: PriceInformation
  lastCheck: number
}

// Map token addresses to their last quote information
export type QuotesMap = Record<string, QuoteInformationObject>

export type QuoteInformationState = {
  readonly [chainId in ChainId]?: Partial<QuotesMap>
}

const initialState: QuoteInformationState = {}

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
    .addCase(updateQuote, (state, action) => {
      initializeState(state, action)
      const { sellToken, chainId } = action.payload
      state[chainId][sellToken] = {
        ...state[chainId][sellToken],
        ...action.payload,
        fee: action.payload.fee || state[chainId][sellToken]?.fee
      }
    })
    .addCase(clearQuote, (state, action) => {
      initializeState(state, action)
      const { token, chainId } = action.payload
      delete state[chainId][token]
    })
)
