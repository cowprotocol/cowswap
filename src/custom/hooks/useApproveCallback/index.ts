import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useActiveWeb3React } from '@src/hooks/web3'
import { Field } from '@src/state/swap/actions'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { useMemo } from 'react'
import { GP_VAULT_RELAYER, V_COW_CONTRACT_ADDRESS } from 'constants/index'
import TradeGp from 'state/swap/TradeGp'
import { ZERO_PERCENT } from 'constants/misc'

import { useApproveCallback } from './useApproveCallbackMod'
export { ApprovalState, useApproveCallback } from './useApproveCallbackMod'

// export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
export function useApproveCallbackFromTrade(
  openTransactionConfirmationModal: (message: string) => void,
  closeModals: () => void,
  trade?: TradeGp,
  allowedSlippage = ZERO_PERCENT
) {
  const { chainId } = useActiveWeb3React()

  const amountToApprove = useMemo(() => {
    if (trade) {
      const slippageForTrade = computeSlippageAdjustedAmounts(trade, allowedSlippage)
      return slippageForTrade[Field.INPUT]
    }
    return undefined
  }, [trade, allowedSlippage])

  const vaultRelayer = chainId ? GP_VAULT_RELAYER[chainId] : undefined

  return useApproveCallback(openTransactionConfirmationModal, closeModals, amountToApprove, vaultRelayer)
}

export type OptionalApproveCallbackParams = {
  transactionSummary: string
}

export function useApproveCallbackFromClaim(
  openTransactionConfirmationModal: (message: string) => void,
  closeModals: () => void,
  amountToApprove: CurrencyAmount<Currency> | undefined
) {
  const { chainId } = useActiveWeb3React()

  const vCowContract = chainId ? V_COW_CONTRACT_ADDRESS[chainId] : undefined

  // Params: modal cbs, amountToApprove: token user is investing e.g, spender: vcow token contract
  return useApproveCallback(openTransactionConfirmationModal, closeModals, amountToApprove, vCowContract)
}
