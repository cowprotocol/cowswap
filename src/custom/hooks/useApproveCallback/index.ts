import { Currency, CurrencyAmount, MaxUint256, Percent } from '@uniswap/sdk-core'
import { useActiveWeb3React } from '@src/hooks/web3'
import { Field } from '@src/state/swap/actions'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { useMemo } from 'react'
import { GP_VAULT_RELAYER, V_COW_CONTRACT_ADDRESS } from 'constants/index'
import TradeGp from 'state/swap/TradeGp'

import { ApproveCallbackParams, useApproveCallback } from './useApproveCallbackMod'
export { ApprovalState, useApproveCallback } from './useApproveCallbackMod'

import { ClaimType } from 'state/claim/hooks'
import { supportedChainId } from 'utils/supportedChainId'
import { EnhancedUserClaimData } from 'pages/Claim/types'

type ApproveCallbackFromTradeParams = Pick<
  ApproveCallbackParams,
  'openTransactionConfirmationModal' | 'closeModals' | 'amountToCheckAgainstAllowance'
> & {
  trade: TradeGp | undefined
  allowedSlippage: Percent
}

// export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
export function useApproveCallbackFromTrade({
  openTransactionConfirmationModal,
  closeModals,
  trade,
  allowedSlippage,
  amountToCheckAgainstAllowance,
}: ApproveCallbackFromTradeParams) {
  const { chainId } = useActiveWeb3React()

  const amountToApprove = useMemo(() => {
    if (trade) {
      const slippageForTrade = computeSlippageAdjustedAmounts(trade, allowedSlippage)
      return slippageForTrade[Field.INPUT]
    }
    return undefined
  }, [trade, allowedSlippage])

  const vaultRelayer = chainId ? GP_VAULT_RELAYER[chainId] : undefined

  return useApproveCallback({
    openTransactionConfirmationModal,
    closeModals,
    amountToApprove,
    spender: vaultRelayer,
    amountToCheckAgainstAllowance,
  })
}

export type OptionalApproveCallbackParams = {
  transactionSummary?: string
  modalMessage?: string
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
  const { chainId } = useActiveWeb3React()
  const supportedChain = supportedChainId(chainId)

  const vCowContract = chainId ? V_COW_CONTRACT_ADDRESS[chainId] : undefined

  // Claim only approves GNO and USDC (GnoOption & Investor, respectively.)
  const approveAmounts = useMemo(() => {
    if (supportedChain && (claim.type === ClaimType.GnoOption || claim.type === ClaimType.Investor)) {
      const investmentCurrency = claim.investCurrency as Currency
      return {
        amountToApprove: CurrencyAmount.fromRawAmount(investmentCurrency, MaxUint256),
        // pass in a custom investmentAmount or just use the maxCost
        amountToCheckAgainstAllowance: investmentAmount || claim.cost,
      }
    }
    return undefined
  }, [claim.cost, claim.investCurrency, claim.type, investmentAmount, supportedChain])

  // Params: modal cbs, amountToApprove: token user is investing e.g, spender: vcow token contract
  return useApproveCallback({
    openTransactionConfirmationModal,
    closeModals,
    spender: vCowContract,
    amountToApprove: approveAmounts?.amountToApprove,
    amountToCheckAgainstAllowance: approveAmounts?.amountToCheckAgainstAllowance,
  })
}
