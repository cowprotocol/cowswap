import { createAction } from '@reduxjs/toolkit'

export type Tip = number

export const updateTip = createAction<{ token: string; tip: Tip }>('operator/updateTip')
export const clearTip = createAction<{ token: string }>('operator/clearTip')
