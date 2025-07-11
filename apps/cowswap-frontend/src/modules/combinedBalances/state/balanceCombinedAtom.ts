import { atomWithReset } from 'jotai/utils'

import { BalancesState, DEFAULT_BALANCES_STATE } from '@cowprotocol/balances-and-allowances'

export const balancesCombinedAtom = atomWithReset<BalancesState>(DEFAULT_BALANCES_STATE)
