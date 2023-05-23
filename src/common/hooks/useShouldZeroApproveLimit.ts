import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useShouldZeroApprove } from './useShouldZeroApprove/useShouldZeroApprove'

export function useShouldZeroApproveLimit() {
  const { inputCurrencyAmount } = useLimitOrdersDerivedState()
  return useShouldZeroApprove(inputCurrencyAmount ?? undefined)
}
