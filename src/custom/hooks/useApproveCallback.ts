import { useActiveWeb3React } from '@src/hooks'
import { useApproveCallback } from '@src/hooks/useApproveCallback'
import { Field } from '@src/state/swap/actions'
import { computeSlippageAdjustedAmounts } from '@src/utils/prices'
import { Trade } from '@uniswap/sdk'
import { useMemo } from 'react'
import { GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS } from '../constants'

export { ApprovalState } from '@src/hooks/useApproveCallback'

export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
  const { chainId } = useActiveWeb3React()

  const amountToApprove = useMemo(() => {
    if (trade) {
      const slippageForTrade = computeSlippageAdjustedAmounts(trade, allowedSlippage)
      return slippageForTrade[Field.INPUT]
    }
    return undefined
  }, [trade, allowedSlippage])

  const allowanceManager = chainId && GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS[chainId]

  return useApproveCallback(amountToApprove, allowanceManager)
}
