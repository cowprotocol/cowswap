import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { advancedOrdersAtom, AdvancedOrdersState, updateAdvancedOrdersAtom } from '../state/advancedOrdersAtom'

export function useAdvancedOrdersState(): AdvancedOrdersState {
  return useAtomValue(advancedOrdersAtom)
}

export function useUpdateAdvancedOrdersState(): (update: Partial<AdvancedOrdersState>) => void {
  return useUpdateAtom(updateAdvancedOrdersAtom)
}
