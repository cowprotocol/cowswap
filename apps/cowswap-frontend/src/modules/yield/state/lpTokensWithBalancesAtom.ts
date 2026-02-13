import { atom } from 'jotai'

import { LpToken } from '@cowprotocol/common-const'

export type LpTokenWithBalance = {
  token: LpToken
  balance: bigint
}

type LpTokensWithBalancesState = { tokens: Record<string, LpTokenWithBalance>; count: 0 }

export const LP_TOKENS_WITH_BALANCES_DEFAULT_STATE: () => LpTokensWithBalancesState = () => ({ tokens: {}, count: 0 })

export const lpTokensWithBalancesAtom = atom<LpTokensWithBalancesState>(LP_TOKENS_WITH_BALANCES_DEFAULT_STATE())
