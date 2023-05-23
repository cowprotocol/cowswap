import { useDerivedSwapInfo } from 'legacy/state/swap/hooks'
import { useShouldZeroApprove } from './useShouldZeroApprove'

export function useShouldZeroApproveSwap() {
  const { parsedAmount } = useDerivedSwapInfo()
  return useShouldZeroApprove(parsedAmount)
}
