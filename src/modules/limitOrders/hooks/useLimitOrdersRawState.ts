import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { limitOrdersRawStateAtom, LimitOrdersRawState, updateLimitOrdersRawStateAtom } from 'modules/limitOrders'

export function useLimitOrdersRawState(): LimitOrdersRawState {
  return useAtomValue(limitOrdersRawStateAtom)
}

export function useUpdateLimitOrdersRawState(): (update: Partial<LimitOrdersRawState>) => void {
  return useUpdateAtom(updateLimitOrdersRawStateAtom)
}
