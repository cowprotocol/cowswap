import { createReducer, PayloadAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { updateFee, clearFee } from './actions'
import { Writable } from 'custom/types'
import { PrefillStateRequired } from '../orders/reducer'
import { FeeQuoteParams } from 'utils/operator'

export const EMPTY_FEE = {
  feeAsCurrency: undefined,
  amount: '0'
}

export interface FeeInformation {
  expirationDate: string
  amount: string
}

export interface FeeInformationObject extends Omit<FeeQuoteParams, 'kind'> {
  fee: FeeInformation
}

// {token address => FeeInformationObject} mapping
export type FeesMap = Record<string, FeeInformationObject>

export type FeeInformationState = {
  readonly [chainId in ChainId]?: Partial<FeesMap>
}

const initialState: FeeInformationState = {}

// makes sure there's always an object at state[chainId], state[chainId].feesMap
function prefillState(
  state: Writable<FeeInformationState>,
  { payload: { chainId } }: PayloadAction<PrefillStateRequired>
): asserts state is Required<FeeInformationState> {
  // asserts that state[chainId].feesMap is ok to access
  const stateAtChainId = state[chainId]

  if (!stateAtChainId) {
    state[chainId] = {}
    return
  }
}

export default createReducer(initialState, builder =>
  builder
    .addCase(updateFee, (state, action) => {
      prefillState(state, action)

      const { sellToken, chainId } = action.payload
      state[chainId][sellToken] = action.payload
    })
    .addCase(clearFee, (state, action) => {
      prefillState(state, action)
      const { token, chainId } = action.payload
      delete state[chainId][token]
    })
)
