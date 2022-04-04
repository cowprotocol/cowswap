import { createAction } from '@reduxjs/toolkit'

export enum SwapVCowStatus {
  INITIAL = 'INITIAL',
  ATTEMPTING = 'ATTEMPTING',
  SUBMITTED = 'SUBMITTED',
}

export type SwapVCowActions = {
  setStatus: (payload: SwapVCowStatus) => void
}

export const setStatus = createAction<SwapVCowStatus>('swapVCow/setStatus')
