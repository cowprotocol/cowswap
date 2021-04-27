import { ChainId } from '@uniswap/sdk'
import { createReducer } from '@reduxjs/toolkit'
import { updateGasPrices, UpdateGasPrices } from './actions'

export type GasState = {
  readonly [chainId in ChainId]?: UpdateGasPrices
}

const initialState: GasState = {}

export default createReducer(initialState, builder =>
  builder.addCase(updateGasPrices, (state, action) => {
    const { chainId, ...rest } = action.payload

    if (chainId) {
      state[chainId] = rest
    }
  })
)
