import { useAtomValue } from 'jotai'

import { TradeTypeInfo } from '../../../common/modules/tradeNavigation'
import { tradeTypeAtom } from '../state/tradeTypeAtom'

export function useTradeTypeInfo(): TradeTypeInfo | null {
  return useAtomValue(tradeTypeAtom)
}
