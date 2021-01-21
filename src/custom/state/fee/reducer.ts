import { createReducer, PayloadAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { updateFee, clearFee } from './actions'
import { Writable } from 'custom/types'
import { PrefillStateRequired } from '../orders/reducer'

export interface FeeInformation {
  expirationDate: string
  minimalFee: string
  feeRatio: number
}

interface FeeInformationObject {
  token: string // token address
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
      const { token, fee, chainId } = action.payload
      state[chainId][token] = { fee, token }
    })
    .addCase(clearFee, (state, action) => {
      prefillState(state, action)
      const { token, chainId } = action.payload
      delete state[chainId][token]
    })
)
