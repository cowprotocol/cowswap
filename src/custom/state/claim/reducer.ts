import { createReducer, current } from '@reduxjs/toolkit'
import {
  setActiveClaimAccount,
  setActiveClaimAccountENS,
  setClaimStatus,
  setClaimedAmount,
  setInputAddress,
  setInvestFlowStep,
  setIsInvestFlowActive,
  initInvestFlowData,
  updateInvestAmount,
  setIsSearchUsed,
  setSelected,
  setSelectedAll,
  resetClaimUi,
  ClaimStatus,
  updateInvestError,
  setEstimatedGas,
  setIsTouched,
} from './actions'

export const initialState: ClaimState = {
  // address/ENS address
  inputAddress: '',
  // account
  activeClaimAccount: '',
  activeClaimAccountENS: '',
  // check address
  isSearchUsed: false,
  // claiming
  claimStatus: ClaimStatus.DEFAULT,
  claimedAmount: '',
  estimatedGas: '',
  // investment
  isInvestFlowActive: false,
  investFlowStep: 0,
  investFlowData: [],
  // table select change
  selected: [],
  selectedAll: false,
}

export type InvestClaim = {
  index: number
  investedAmount: string
  error?: string
  isTouched?: boolean
}

export type ClaimState = {
  // address/ENS address
  inputAddress: string
  // account
  activeClaimAccount: string
  activeClaimAccountENS: string
  // check address
  isSearchUsed: boolean
  // claiming
  claimStatus: ClaimStatus
  claimedAmount: string
  estimatedGas: string
  // investment
  isInvestFlowActive: boolean
  investFlowStep: number
  investFlowData: InvestClaim[]
  // table select change
  selected: number[]
  selectedAll: boolean
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setInputAddress, (state, { payload }) => {
      state.inputAddress = payload
    })
    .addCase(setActiveClaimAccount, (state, { payload }) => {
      state.activeClaimAccount = payload
    })
    .addCase(setActiveClaimAccountENS, (state, { payload }) => {
      state.activeClaimAccountENS = payload
    })
    .addCase(setIsSearchUsed, (state, { payload }) => {
      state.isSearchUsed = payload
    })
    .addCase(setClaimStatus, (state, { payload }) => {
      state.claimStatus = payload
    })
    .addCase(setClaimedAmount, (state, { payload }) => {
      state.claimedAmount = payload
    })
    .addCase(setEstimatedGas, (state, { payload }) => {
      state.estimatedGas = payload
    })
    .addCase(setIsInvestFlowActive, (state, { payload }) => {
      state.isInvestFlowActive = payload
    })
    .addCase(setInvestFlowStep, (state, { payload }) => {
      state.investFlowStep = payload
    })
    .addCase(initInvestFlowData, (state) => {
      const { selected, isInvestFlowActive } = current(state)

      const data = selected.map((index) => ({ index, investedAmount: '0' }))

      if (isInvestFlowActive) {
        state.investFlowData.push(...data)
      } else {
        state.investFlowData.length = 0
      }
    })
    .addCase(updateInvestAmount, (state, { payload: { index, amount } }) => {
      state.investFlowData[index].investedAmount = amount
    })
    .addCase(updateInvestError, (state, { payload: { index, error } }) => {
      state.investFlowData[index].error = error
    })
    .addCase(setSelected, (state, { payload }) => {
      state.selected = payload
    })
    .addCase(setSelectedAll, (state, { payload }) => {
      state.selectedAll = payload
    })
    .addCase(resetClaimUi, (state) => {
      state.selected = initialState.selected
      state.selectedAll = initialState.selectedAll
      state.investFlowStep = initialState.investFlowStep
      state.isInvestFlowActive = initialState.isInvestFlowActive
      state.claimedAmount = initialState.claimedAmount
      state.estimatedGas = initialState.estimatedGas
    })
    .addCase(setIsTouched, (state, { payload: { index, isTouched } }) => {
      state.investFlowData[index].isTouched = isTouched
    })
)
