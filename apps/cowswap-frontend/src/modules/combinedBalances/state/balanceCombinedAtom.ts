import { atomWithReset } from 'jotai/utils'

import { BalancesState } from '@cowprotocol/balances-and-allowances'

export const balancesCombinedAtom = atomWithReset<BalancesState>({ isLoading: false, values: {}, chainId: null })
