import { createAction } from '@reduxjs/toolkit'

export enum SwapVCowStatus {
  INITIAL = 'INITIAL',
  ATTEMPTING = 'ATTEMPTING',
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
}

export type CowTokenActions = {
  setSwapVCowStatus: (payload: SwapVCowStatus) => void
}

export const setSwapVCowStatus = createAction<SwapVCowStatus>('cowToken/setSwapVCowStatus')
