import { useAtomValue } from 'jotai'

import { balancesAtom, BalancesState } from '../state/balancesAtom'

export function useTokensBalances(): BalancesState {
  return useAtomValue(balancesAtom)
}
