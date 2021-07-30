import { createAction } from '@reduxjs/toolkit'

export const updateReferrerAddress = createAction<{ referrer: string }>('affiliate/updateReferrerAddress')
