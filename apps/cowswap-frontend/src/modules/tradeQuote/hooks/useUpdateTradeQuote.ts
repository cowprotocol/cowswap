import { useSetAtom } from 'jotai/index'

import { updateTradeQuoteAtom } from '../state/tradeQuoteAtom'

export function useUpdateTradeQuote() {
  return useSetAtom(updateTradeQuoteAtom)
}
