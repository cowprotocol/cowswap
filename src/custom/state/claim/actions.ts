import { createAction } from '@reduxjs/toolkit'

export enum ClaimStatus {
  DEFAULT = 'DEFAULT',
  ATTEMPTING = 'ATTEMPTING',
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
}

export type ClaimActions = {
  // account
  setInputAddress: (payload: string) => void
  setActiveClaimAccount: (payload: string) => void
  setActiveClaimAccountENS: (payload: string) => void
  // search
  setIsSearchUsed: (payload: boolean) => void
  // claiming
  setClaimStatus: (payload: ClaimStatus) => void
  setClaimedAmount: (payload: number) => void
  // investing
  setIsInvestFlowActive: (payload: boolean) => void
  setInvestFlowStep: (payload: number) => void
  // claim row selection
  setSelected: (payload: number[]) => void
  setSelectedAll: (payload: boolean) => void
}

// accounts
export const setInputAddress = createAction<string>('claim/setInputAddress')
export const setActiveClaimAccount = createAction<string>('claim/setActiveClaimAccount')
export const setActiveClaimAccountENS = createAction<string>('claim/setActiveClaimAccountENS')

// search
export const setIsSearchUsed = createAction<boolean>('claim/setIsSearchUsed')

// claiming
export const setClaimedAmount = createAction<number>('claim/setClaimedAmount')
export const setClaimStatus = createAction<ClaimStatus>('claim/setClaimStatus')

// investing
export const setIsInvestFlowActive = createAction<boolean>('claim/setIsInvestFlowActive')
export const setInvestFlowStep = createAction<number>('claim/setInvestFlowStep')

// claim row selection
export const setSelected = createAction<number[]>('claim/setSelected')
export const setSelectedAll = createAction<boolean>('claim/setSelectedAll')
