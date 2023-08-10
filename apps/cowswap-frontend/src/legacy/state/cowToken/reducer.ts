import { createReducer } from '@reduxjs/toolkit'

import { SwapVCowStatus, setSwapVCowStatus } from './actions'

export type CowTokenState = {
  swapVCowStatus: SwapVCowStatus
}

export const initialState: CowTokenState = {
  swapVCowStatus: SwapVCowStatus.INITIAL,
}

export default createReducer(initialState, (builder) =>
  builder.addCase(setSwapVCowStatus, (state, { payload }) => {
    state.swapVCowStatus = payload
  })
)
