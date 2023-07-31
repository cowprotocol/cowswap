import { useAtomValue, useSetAtom } from 'jotai'

import { ExtendedTradeRawState } from 'modules/trade/types/TradeRawState'

import { advancedOrdersAtom, updateAdvancedOrdersAtom } from '../state/advancedOrdersAtom'

export function useAdvancedOrdersRawState(): ExtendedTradeRawState {
  return useAtomValue(advancedOrdersAtom)
}

export function useUpdateAdvancedOrdersRawState(): (update: Partial<ExtendedTradeRawState>) => void {
  return useSetAtom(updateAdvancedOrdersAtom)
}
