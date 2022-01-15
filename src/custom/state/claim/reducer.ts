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
  ClaimStatus,
} from './actions'
import { InvestmentClaimProps } from 'pages/Claim/InvestmentFlow'

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
  claimedAmount: 0,
  // investment
  isInvestFlowActive: false,
  investFlowStep: 0,
  investFlowData: [],
  // table select change
  selected: [],
  selectedAll: false,
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
  claimedAmount: number
  // investment
  isInvestFlowActive: boolean
  investFlowStep: number
  investFlowData: InvestmentClaimProps[]
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
    .addCase(setIsInvestFlowActive, (state, { payload }) => {
      state.isInvestFlowActive = payload
    })
    .addCase(setInvestFlowStep, (state, { payload }) => {
      state.investFlowStep = payload
    })
    .addCase(initInvestFlowData, (state, { payload }) => {
      const { selected } = current(state)

      const data = payload.reduce<InvestmentClaimProps[]>((acc, claim) => {
        if (selected.includes(claim.index)) {
          acc.push({ ...claim, investedAmount: '0' })
        }

        return acc
      }, [])

      state.investFlowData.push(...data)
    })
    .addCase(updateInvestAmount, (state, { payload: { index, amount } }) => {
      const { investFlowData } = current(state)

      const claimIndex = investFlowData.findIndex((claim) => claim.index === index)

      if (claimIndex !== -1) {
        state.investFlowData[claimIndex].investedAmount = amount
      }
    })
    .addCase(setSelected, (state, { payload }) => {
      state.selected = payload
    })
    .addCase(setSelectedAll, (state, { payload }) => {
      state.selectedAll = payload
    })
)
