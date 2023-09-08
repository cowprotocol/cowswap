import { useMemo } from 'react'

import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount, MaxUint256 } from '@uniswap/sdk-core'

import { V_COW_CONTRACT_ADDRESS } from 'legacy/constants'
import { ClaimType } from 'legacy/state/claim/hooks'

import { useWalletInfo } from 'modules/wallet'

import { EnhancedUserClaimData } from 'pages/Claim/types'

import { ApprovalState, ApproveCallbackParams, useApproveCallback } from './useApproveCallbackMod'

export type OptionalApproveCallbackParams = {
  transactionSummary?: string
  modalMessage?: string
  useModals?: boolean
}

export interface ApproveCallback {
  (params?: OptionalApproveCallbackParams): Promise<TransactionResponse | undefined>
}

export type ApproveCallbackState = {
  approvalState: ApprovalState
  approve: ApproveCallback
  revokeApprove: (optionalParams?: OptionalApproveCallbackParams | undefined) => Promise<void>
  isPendingApproval: boolean
}

type ApproveCallbackFromClaimParams = Omit<
  ApproveCallbackParams,
  'spender' | 'amountToApprove' | 'amountToCheckAgainstAllowance'
> & {
  claim: EnhancedUserClaimData
  investmentAmount?: CurrencyAmount<Currency>
}

export function useApproveCallbackFromClaim({
  openTransactionConfirmationModal,
  closeModals,
  claim,
  investmentAmount,
}: ApproveCallbackFromClaimParams) {
  const { chainId } = useWalletInfo()

  const vCowContract = chainId ? V_COW_CONTRACT_ADDRESS[chainId] : undefined

  // Claim only approves GNO and USDC (GnoOption & Investor, respectively.)
  const approveAmounts = useMemo(() => {
    if (claim.type === ClaimType.GnoOption || claim.type === ClaimType.Investor) {
      const investmentCurrency = claim.currencyAmount?.currency as Currency
      return {
        amountToApprove: CurrencyAmount.fromRawAmount(investmentCurrency, MaxUint256),
        // pass in a custom investmentAmount or just use the maxCost
        amountToCheckAgainstAllowance: investmentAmount || claim.cost,
      }
    }
    return undefined
  }, [claim.cost, claim.currencyAmount?.currency, claim.type, investmentAmount])

  // Params: modal cbs, amountToApprove: token user is investing e.g, spender: vcow token contract
  return useApproveCallback({
    openTransactionConfirmationModal,
    closeModals,
    spender: vCowContract,
    amountToApprove: approveAmounts?.amountToApprove,
    amountToCheckAgainstAllowance: approveAmounts?.amountToCheckAgainstAllowance,
  })
}
