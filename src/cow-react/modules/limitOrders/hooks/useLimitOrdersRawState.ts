import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { limitOrdersAtom, LimitOrdersRawState, updateLimitOrdersAtom } from '@cow/modules/limitOrders'

export function useLimitOrdersRawState(): LimitOrdersRawState {
  return useAtomValue(limitOrdersAtom)
}

export function useUpdateLimitOrdersRawState(): (update: Partial<LimitOrdersRawState>) => void {
  return useUpdateAtom(updateLimitOrdersAtom)
}
