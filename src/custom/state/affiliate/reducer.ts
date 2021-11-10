import { createReducer } from '@reduxjs/toolkit'
import { dismissNotification, updateAppDataHash, updateReferralAddress } from './actions'
import { APP_DATA_HASH } from 'constants/index'

export interface AffiliateState {
  referralAddress?: {
    value: string
    isValid: boolean
  }
  appDataHash?: string
  isNotificationClosed?: {
    [key: string]: boolean
  }
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
    .addCase(dismissNotification, (state, action) => {
      state.isNotificationClosed = state.isNotificationClosed ?? {}
      state.isNotificationClosed[action.payload] = true
    })
)
