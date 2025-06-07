import { useAtomValue } from 'jotai'

import { tradeConfirmStateAtom } from '../state/tradeConfirmStateAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useTradeConfirmState() {
  return useAtomValue(tradeConfirmStateAtom)
}
