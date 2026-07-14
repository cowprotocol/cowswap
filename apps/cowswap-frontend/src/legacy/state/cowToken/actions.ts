import { createAction } from '@reduxjs/toolkit'

export type CowTokenActions = {
  setSwapVCowStatus: (payload: SwapVCowStatus) => void
}

export enum SwapVCowStatus {
  INITIAL = 'INITIAL',
  ATTEMPTING = 'ATTEMPTING',
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
}

export const setSwapVCowStatus = createAction<SwapVCowStatus>('cowToken/setSwapVCowStatus')
