import { createReducer } from '@reduxjs/toolkit'
import { SwapVCowStatus, setStatus } from './actions'

export type SwapVCowState = {
  status: SwapVCowStatus
}

export const initialState: SwapVCowState = {
  status: SwapVCowStatus.INITIAL,
}

export default createReducer(initialState, (builder) =>
  builder.addCase(setStatus, (state, { payload }) => {
    state.status = payload
  })
)
