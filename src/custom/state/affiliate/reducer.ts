import { createReducer } from '@reduxjs/toolkit'
import { dismissNotification, setReferralAddressActive, updateAddress, updateReferralAddress } from './actions'

export interface AffiliateState {
  referralAddress?: {
    value: string
    isValid: boolean
    isActive?: boolean
  }
  isNotificationClosed?: {
    [key: string]: boolean
  }
  address?: string // this can be an ENS name or an address
}

export const initialState: AffiliateState = {}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateReferralAddress, (state, action) => {
      state.referralAddress = action.payload ? { ...state.referralAddress, ...action.payload } : undefined
    })
    .addCase(setReferralAddressActive, (state, action) => {
      if (state.referralAddress) {
        state.referralAddress.isActive = action.payload
      }
    })
    .addCase(updateAddress, (state, action) => {
      state.address = action.payload
    })
    .addCase(dismissNotification, (state, action) => {
      state.isNotificationClosed = state.isNotificationClosed ?? {}
      state.isNotificationClosed[action.payload] = true
    })
)
