import { useAtomValue } from 'jotai/index'

import { tradeConfirmStateAtom } from '../state/tradeConfirmStateAtom'

export function useTradeConfirmState() {
  return useAtomValue(tradeConfirmStateAtom)
}
