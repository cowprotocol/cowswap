import { createReducer } from '@reduxjs/toolkit'
import { dismissNotification, updateAppDataHash, updateReferralAddress } from './actions'
import { APP_DATA_HASH, IS_NOTIFICATION_CLOSED } from 'constants/index'

export interface AffiliateState {
  referralAddress?: {
    value: string
    isValid: boolean
  }
  appDataHash?: string
  isNotificationClosed?: boolean
}

export const initialState: AffiliateState = {
  appDataHash: APP_DATA_HASH,
  isNotificationClosed: IS_NOTIFICATION_CLOSED,
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
      state.isNotificationClosed = action.payload
    })
)
