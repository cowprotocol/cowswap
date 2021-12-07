import { createAction } from '@reduxjs/toolkit'

export const updateReferralAddress = createAction<{
  value: string
  isValid: boolean
} | null>('affiliate/updateReferralAddress')

export const updateAddress = createAction<string>('affiliate/updateAddress')

export const updateAppDataHash = createAction<string>('affiliate/updateAppDataHash')

export const dismissNotification = createAction<string>('affiliate/dismissNotification')
