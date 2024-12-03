import { useAtomValue } from 'jotai'

import { balancesCombinedAtom } from '../state/balanceCombinedAtom'

export function useTokensBalancesCombined() {
  return useAtomValue(balancesCombinedAtom)
}
