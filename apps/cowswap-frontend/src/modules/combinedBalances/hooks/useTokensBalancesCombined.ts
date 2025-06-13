import { useAtomValue } from 'jotai'

import { balancesCombinedAtom } from '../state/balanceCombinedAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useTokensBalancesCombined() {
  return useAtomValue(balancesCombinedAtom)
}
