import { createReducer } from '@reduxjs/toolkit'
import { updateReferrerAddress } from './actions'

export interface AffiliateLinkState {
  referrerAddress: string
}

export const initialState: AffiliateLinkState = {
  referrerAddress: '',
}

export default createReducer(initialState, (builder) =>
  builder.addCase(updateReferrerAddress, (state, action) => {
    state.referrerAddress = action.payload.referrer
  })
)
