import { useAtomValue } from 'jotai'

import { lpTokensWithBalancesAtom } from '../state/lpTokensWithBalancesAtom'

export function useLpTokensWithBalances() {
  return useAtomValue(lpTokensWithBalancesAtom)
}
