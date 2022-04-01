import { createReducer, current } from '@reduxjs/toolkit'
import { SupportedChainId } from '@src/custom/constants/chains'
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
  setClaimsCount,
  SwapVCowStatus,
  setSwapVCowStatus,
} from './actions'

export type ClaimInfo = {
  total: number
  available?: number | undefined
  claimed?: number | undefined
  expired?: number | undefined
}
const DEFAULT_CLAIM_INFO: ClaimInfo = {
  total: 0,
}

type ClaimInfoPerChain = Record<SupportedChainId, ClaimInfo>

const DEFAULT_CLAIM_INFO_PER_CHAIN: ClaimInfoPerChain = {
  [SupportedChainId.MAINNET]: { ...DEFAULT_CLAIM_INFO },
  [SupportedChainId.XDAI]: { ...DEFAULT_CLAIM_INFO },
  [SupportedChainId.RINKEBY]: { ...DEFAULT_CLAIM_INFO },
}

type ClaimInfoPerAccount = Record<string, ClaimInfoPerChain>

const DEFAULT_CLAIM_INFO_PER_ACCOUNT: ClaimInfoPerAccount = {}

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
  investFlowData: {},
  // table select change
  selected: [],
  selectedAll: false,
  // claims on other networks
  claimInfoPerAccount: { ...DEFAULT_CLAIM_INFO_PER_ACCOUNT },
  // swap VCow status
  swapVCowStatus: SwapVCowStatus.INITIAL,
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
  investFlowData: Record<number, InvestClaim>
  // table select change
  selected: number[]
  selectedAll: boolean
  // claims on other chains
  claimInfoPerAccount: ClaimInfoPerAccount
  // swap VCow status
  swapVCowStatus: SwapVCowStatus
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setClaimsCount, (state, { payload }) => {
      const { chain, claimInfo, account } = payload
      state.claimInfoPerAccount[account] = state.claimInfoPerAccount[account] || {
        ...DEFAULT_CLAIM_INFO_PER_CHAIN,
      }

      const newState: ClaimInfo = { ...DEFAULT_CLAIM_INFO }

      // Only update the value if present to avoid overwriting data fetched on another network
      if (claimInfo.total !== undefined) newState.total = claimInfo.total
      if (claimInfo.claimed !== undefined) newState.claimed = claimInfo.claimed
      if (claimInfo.available !== undefined) newState.available = claimInfo.available
      if (claimInfo.expired !== undefined) newState.expired = claimInfo.expired

      state.claimInfoPerAccount[account][chain] = {
        ...state.claimInfoPerAccount[account][chain],
        ...newState,
      }
    })
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

      if (isInvestFlowActive) {
        state.investFlowData = selected.reduce<Record<number, InvestClaim>>((acc, index) => {
          acc[index] = { index, investedAmount: '0' }
          return acc
        }, {})
      } else {
        state.investFlowData = {}
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
      state.claimStatus = initialState.claimStatus
    })
    .addCase(setIsTouched, (state, { payload: { index, isTouched } }) => {
      state.investFlowData[index].isTouched = isTouched
    })
    .addCase(setSwapVCowStatus, (state, { payload }) => {
      state.swapVCowStatus = payload
    })
)
