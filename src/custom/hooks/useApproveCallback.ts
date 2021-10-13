import { useActiveWeb3React } from '@src/hooks/web3'
import { useApproveCallback } from '@src/hooks/useApproveCallback'
import { Field } from '@src/state/swap/actions'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { useMemo } from 'react'
import { GP_VAULT_RELAYER } from 'constants/index'
import TradeGp from 'state/swap/TradeGp'
import { ZERO_PERCENT } from 'constants/misc'

export { useApproveCallback, ApprovalState } from '@src/hooks/useApproveCallback'

// export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
export function useApproveCallbackFromTrade(trade?: TradeGp, allowedSlippage = ZERO_PERCENT) {
  const { chainId } = useActiveWeb3React()

  const amountToApprove = useMemo(() => {
    if (trade) {
      const slippageForTrade = computeSlippageAdjustedAmounts(trade, allowedSlippage)
      return slippageForTrade[Field.INPUT]
    }
    return undefined
  }, [trade, allowedSlippage])

  const vaultRelayer = chainId ? GP_VAULT_RELAYER[chainId] : undefined

  return useApproveCallback(amountToApprove, vaultRelayer)
}
