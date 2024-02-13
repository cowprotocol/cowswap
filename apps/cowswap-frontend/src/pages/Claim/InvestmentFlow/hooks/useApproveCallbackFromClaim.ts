import { useMemo } from 'react'

import { V_COW_CONTRACT_ADDRESS } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount, MaxUint256 } from '@uniswap/sdk-core'

import { ClaimType } from 'legacy/state/claim/hooks/types'
import { EnhancedUserClaimData } from 'legacy/state/claim/types'

import { useApproveCallback } from 'common/hooks/useApproveCallback'
import { ApprovalState, useApproveState } from 'common/hooks/useApproveState'

type ApproveCallbackState = {
  approvalState: ApprovalState
  approve: (summary: string) => Promise<TransactionResponse | undefined>
  revokeApprove: (summary: string) => Promise<TransactionResponse | undefined>
}

export function useApproveCallbackFromClaim(claim: EnhancedUserClaimData): ApproveCallbackState {
  const { chainId } = useWalletInfo()

  const vCowContract = chainId ? V_COW_CONTRACT_ADDRESS[chainId] : undefined

  // Claim only approves GNO and USDC (GnoOption & Investor, respectively.)
  const approveAmounts = useMemo(() => {
    if (claim.type === ClaimType.GnoOption || claim.type === ClaimType.Investor) {
      const investmentCurrency = claim.currencyAmount?.currency as Currency
      return {
        amountToApprove: CurrencyAmount.fromRawAmount(investmentCurrency, MaxUint256),
        // pass in a custom investmentAmount or just use the maxCost
        amountToCheckAgainstAllowance: claim.cost,
      }
    }
    return undefined
  }, [claim.cost, claim.currencyAmount?.currency, claim.type])

  const { state: approvalState } = useApproveState(
    approveAmounts?.amountToApprove,
    approveAmounts?.amountToCheckAgainstAllowance
  )

  const zeroAmount = useMemo(() => {
    const currency = claim.currencyAmount?.currency as Currency

    if (!currency) return undefined

    return CurrencyAmount.fromRawAmount(currency, '0')
  }, [claim])
  const revokeApprove = useApproveCallback(zeroAmount, vCowContract)
  const approveCallback = useApproveCallback(approveAmounts?.amountToApprove, vCowContract)

  // Params: modal cbs, amountToApprove: token user is investing e.g, spender: vcow token contract
  return {
    approvalState,
    revokeApprove,
    approve: approveCallback,
  }
}
