import { useDerivedSwapInfo } from 'legacy/state/swap/hooks'
import { useShouldZeroApprove } from './useShouldZeroApprove'

export function useShouldZeroApproveSwap() {
  const { v2Trade, allowedSlippage } = useDerivedSwapInfo()
  return useShouldZeroApprove(v2Trade?.maximumAmountIn(allowedSlippage))
}
