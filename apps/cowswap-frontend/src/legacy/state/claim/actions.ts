import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createAction } from '@reduxjs/toolkit'

import { ClaimInfo } from './reducer'

export enum ClaimStatus {
  DEFAULT = 'DEFAULT',
  ATTEMPTING = 'ATTEMPTING',
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

// accounts
export const setInputAddress = createAction<string>('claim/setInputAddress')
export const setActiveClaimAccount = createAction<string>('claim/setActiveClaimAccount')
export const setActiveClaimAccountENS = createAction<string>('claim/setActiveClaimAccountENS')

// search
export const setIsSearchUsed = createAction<boolean>('claim/setIsSearchUsed')

// claiming
export const setClaimedAmount = createAction<string>('claim/setClaimedAmount')
export const setClaimStatus = createAction<ClaimStatus>('claim/setClaimStatus')
export const setEstimatedGas = createAction<string>('claim/setEstimatedGas')

// investing
export const setIsInvestFlowActive = createAction<boolean>('claim/setIsInvestFlowActive')
export const setInvestFlowStep = createAction<number>('claim/setInvestFlowStep')
export const initInvestFlowData = createAction('claim/initInvestFlowData')
export const updateInvestAmount = createAction<{
  index: number
  amount: string
}>('claim/updateInvestAmount')
export const updateInvestError = createAction<{
  index: number
  error: string | undefined
}>('claim/updateInvestError')
export const setIsTouched = createAction<{
  index: number
  isTouched: boolean
}>('claim/setIsTouched')
// claim row selection
export const setSelected = createAction<number[]>('claim/setSelected')
export const setSelectedAll = createAction<boolean>('claim/setSelectedAll')
// Claim UI reset sugar
export const resetClaimUi = createAction('claims/resetClaimUi')
// Claims on other chains
export const setClaimsCount = createAction<{
  chain: SupportedChainId
  claimInfo: Partial<ClaimInfo>
  account: string
}>('claims/setClaimsCount')
