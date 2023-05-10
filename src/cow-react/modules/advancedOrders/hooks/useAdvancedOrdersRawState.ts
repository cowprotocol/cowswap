import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { advancedOrdersAtom, AdvancedOrdersRawState, updateAdvancedOrdersAtom } from '../state/advancedOrdersAtom'

export function useAdvancedOrdersRawState(): AdvancedOrdersRawState {
  return useAtomValue(advancedOrdersAtom)
}

export function useUpdateAdvancedOrdersRawState(): (update: Partial<AdvancedOrdersRawState>) => void {
  return useUpdateAtom(updateAdvancedOrdersAtom)
}
