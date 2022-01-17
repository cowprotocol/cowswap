import { Percent } from '@uniswap/sdk-core'
import { useActiveWeb3React } from '@src/hooks/web3'
import { Field } from '@src/state/swap/actions'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { useMemo } from 'react'
import { GP_VAULT_RELAYER, V_COW_CONTRACT_ADDRESS } from 'constants/index'
import TradeGp from 'state/swap/TradeGp'

import { ApproveCallbackParams, useApproveCallback } from './useApproveCallbackMod'
export { ApprovalState, useApproveCallback } from './useApproveCallbackMod'

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
  transactionSummary: string
}

type ApproveCallbackFromClaimParams = Omit<ApproveCallbackParams, 'spender'>

export function useApproveCallbackFromClaim({
  openTransactionConfirmationModal,
  closeModals,
  amountToApprove,
  amountToCheckAgainstAllowance,
}: ApproveCallbackFromClaimParams) {
  const { chainId } = useActiveWeb3React()

  const vCowContract = chainId ? V_COW_CONTRACT_ADDRESS[chainId] : undefined

  // Params: modal cbs, amountToApprove: token user is investing e.g, spender: vcow token contract
  return useApproveCallback({
    openTransactionConfirmationModal,
    closeModals,
    amountToApprove,
    spender: vCowContract,
    amountToCheckAgainstAllowance,
  })
}
