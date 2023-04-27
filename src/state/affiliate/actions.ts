import { createAction } from '@reduxjs/toolkit'

export const updateReferralAddress = createAction<{
  value: string
  isValid: boolean
} | null>('affiliate/updateReferralAddress')

export const setReferralAddressActive = createAction<boolean>('affiliate/setReferralAddressActive')

export const updateAddress = createAction<string>('affiliate/updateAddress')

export const dismissNotification = createAction<string>('affiliate/dismissNotification')
