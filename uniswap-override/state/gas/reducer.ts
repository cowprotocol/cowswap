import { SupportedChainId as ChainId } from 'constants/chains'
import { createReducer } from '@reduxjs/toolkit'
import { updateGasPrices, UpdateGasPrices } from './actions'

export type GasState = {
  readonly [chainId in ChainId]?: UpdateGasPrices
}

const initialState: GasState = {}

export default createReducer(initialState, (builder) =>
  builder.addCase(updateGasPrices, (state, action) => {
    const { chainId, ...rest } = action.payload

    if (chainId) {
      state[chainId] = {
        ...rest,
        // We don't use the last update of the endpoint, we use the one of the client time
        lastUpdate: new Date().toISOString(),
      }
    }
  })
)
