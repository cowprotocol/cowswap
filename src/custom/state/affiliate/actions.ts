import { createAction } from '@reduxjs/toolkit'

export const updateReferralAddress = createAction<string>('affiliate/updateReferralAddress')
export const updateAppDataHash = createAction<string>('affiliate/updateAppDataHash')
