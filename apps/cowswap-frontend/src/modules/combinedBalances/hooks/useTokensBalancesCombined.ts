import { useAtomValue } from 'jotai'

import type { BalancesState } from '@cowprotocol/balances-and-allowances'

import { balancesCombinedAtom } from '../state/balanceCombinedAtom'

export function useTokensBalancesCombined(): BalancesState {
  return useAtomValue(balancesCombinedAtom)
}
