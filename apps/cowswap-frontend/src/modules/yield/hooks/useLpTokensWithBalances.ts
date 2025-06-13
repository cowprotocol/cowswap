import { useAtomValue } from 'jotai'

import { lpTokensWithBalancesAtom } from '../state/lpTokensWithBalancesAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useLpTokensWithBalances() {
  return useAtomValue(lpTokensWithBalancesAtom)
}
