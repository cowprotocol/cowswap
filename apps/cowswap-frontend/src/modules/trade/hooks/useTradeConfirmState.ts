import { useAtomValue } from 'jotai'

import { tradeConfirmStateAtom } from '../state/tradeConfirmStateAtom'

export function useTradeConfirmState() {
  return useAtomValue(tradeConfirmStateAtom)
}
