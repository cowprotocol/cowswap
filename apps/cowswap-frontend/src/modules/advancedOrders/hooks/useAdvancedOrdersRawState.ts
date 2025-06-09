import { useAtomValue, useSetAtom } from 'jotai'

import { ExtendedTradeRawState } from 'modules/trade/types/TradeRawState'

import { advancedOrdersAtom, updateAdvancedOrdersAtom } from '../state/advancedOrdersAtom'

export function useAdvancedOrdersRawState(): ExtendedTradeRawState {
  return useAtomValue(advancedOrdersAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateAdvancedOrdersRawState() {
  return useSetAtom(updateAdvancedOrdersAtom)
}
