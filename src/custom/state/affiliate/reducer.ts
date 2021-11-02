import { createReducer } from '@reduxjs/toolkit'
import { updateAppDataHash, updateReferralAddress } from './actions'
import { APP_DATA_HASH } from 'constants/index'

export interface AffiliateState {
  referralAddress?: {
    value: string
    isValid: boolean
  }
  appDataHash: string
}

export const initialState: AffiliateState = {
  appDataHash: APP_DATA_HASH,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateReferralAddress, (state, action) => {
      state.referralAddress = action.payload ?? undefined
    })
    .addCase(updateAppDataHash, (state, action) => {
      state.appDataHash = action.payload
    })
)
