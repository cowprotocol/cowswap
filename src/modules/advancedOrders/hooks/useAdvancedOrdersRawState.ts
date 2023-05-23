import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { advancedOrdersAtom, updateAdvancedOrdersAtom } from '../state/advancedOrdersAtom'
import { ExtendedTradeRawState } from 'modules/trade/types/TradeRawState'

export function useAdvancedOrdersRawState(): ExtendedTradeRawState {
  return useAtomValue(advancedOrdersAtom)
}

export function useUpdateAdvancedOrdersRawState(): (update: Partial<ExtendedTradeRawState>) => void {
  return useUpdateAtom(updateAdvancedOrdersAtom)
}
