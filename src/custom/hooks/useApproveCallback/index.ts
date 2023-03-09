import { Currency, CurrencyAmount, MaxUint256, Percent, Token } from '@uniswap/sdk-core'
import { Field } from '@src/state/swap/actions'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { useMemo } from 'react'
import { GP_VAULT_RELAYER, V_COW_CONTRACT_ADDRESS } from 'constants/index'
import TradeGp from 'state/swap/TradeGp'

import { ApprovalState, ApproveCallbackParams, useApproveCallback } from './useApproveCallbackMod'

import { ClaimType } from 'state/claim/hooks'
import { supportedChainId } from 'utils/supportedChainId'
import { EnhancedUserClaimData } from '@cow/pages/Claim/types'
import { TransactionResponse } from '@ethersproject/providers'
import { useWalletInfo } from '@cow/modules/wallet'

export { ApprovalState, useApproveCallback } from './useApproveCallbackMod'

export type ApproveCallbackFromTradeParams = Pick<
  ApproveCallbackParams,
  'openTransactionConfirmationModal' | 'closeModals' | 'amountToCheckAgainstAllowance'
> & {
  trade: TradeGp | undefined
  allowedSlippage: Percent
  isNativeFlow?: boolean
}

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

// export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
export function useApproveCallbackFromTrade({
  openTransactionConfirmationModal,
  closeModals,
  trade,
  allowedSlippage,
  amountToCheckAgainstAllowance,
  isNativeFlow,
}: ApproveCallbackFromTradeParams): ApproveCallbackState {
  const { chainId } = useWalletInfo()

  const amountToApprove = useMemo(() => {
    if (trade) {
      const slippageForTrade = computeSlippageAdjustedAmounts(trade, allowedSlippage)
      return isNativeFlow ? slippageForTrade[Field.INPUT]?.wrapped : slippageForTrade[Field.INPUT]
    }
    return undefined
  }, [trade, allowedSlippage, isNativeFlow])

  const vaultRelayer = chainId ? GP_VAULT_RELAYER[chainId] : undefined

  return useApproveCallback({
    openTransactionConfirmationModal,
    closeModals,
    amountToApprove,
    spender: vaultRelayer,
    amountToCheckAgainstAllowance,
  })
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
  const supportedChain = supportedChainId(chainId)

  const vCowContract = chainId ? V_COW_CONTRACT_ADDRESS[chainId] : undefined

  // Claim only approves GNO and USDC (GnoOption & Investor, respectively.)
  const approveAmounts = useMemo(() => {
    if (supportedChain && (claim.type === ClaimType.GnoOption || claim.type === ClaimType.Investor)) {
      const investmentCurrency = claim.currencyAmount?.currency as Currency
      return {
        amountToApprove: CurrencyAmount.fromRawAmount(investmentCurrency, MaxUint256),
        // pass in a custom investmentAmount or just use the maxCost
        amountToCheckAgainstAllowance: investmentAmount || claim.cost,
      }
    }
    return undefined
  }, [claim.cost, claim.currencyAmount?.currency, claim.type, investmentAmount, supportedChain])

  // Params: modal cbs, amountToApprove: token user is investing e.g, spender: vcow token contract
  return useApproveCallback({
    openTransactionConfirmationModal,
    closeModals,
    spender: vCowContract,
    amountToApprove: approveAmounts?.amountToApprove,
    amountToCheckAgainstAllowance: approveAmounts?.amountToCheckAgainstAllowance,
  })
}

type ApproveCallbackFromBalanceParams = Omit<
  ApproveCallbackParams,
  'spender' | 'amountToApprove' | 'amountToCheckAgainstAllowance'
> & {
  token: Token
  balance?: CurrencyAmount<Currency>
}

export function useApproveCallbackFromBalance({
  openTransactionConfirmationModal,
  closeModals,
  token,
  balance,
}: ApproveCallbackFromBalanceParams) {
  const { chainId } = useWalletInfo()
  const supportedChain = supportedChainId(chainId)

  const vaultRelayer = chainId ? GP_VAULT_RELAYER[chainId] : undefined

  const approveAmounts = useMemo(() => {
    if (supportedChain) {
      return {
        amountToApprove: CurrencyAmount.fromRawAmount(token, MaxUint256),
        amountToCheckAgainstAllowance: balance,
      }
    }
    return undefined
  }, [balance, supportedChain, token])

  return useApproveCallback({
    openTransactionConfirmationModal,
    closeModals,
    spender: vaultRelayer,
    amountToApprove: approveAmounts?.amountToApprove,
    amountToCheckAgainstAllowance: approveAmounts?.amountToCheckAgainstAllowance,
  })
}
