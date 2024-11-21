import { atom } from 'jotai'

import { LpToken } from '@cowprotocol/common-const'
import { BigNumber } from '@ethersproject/bignumber'

export type LpTokenWithBalance = {
  token: LpToken
  balance: BigNumber
}

type LpTokensWithBalancesState = { tokens: Record<string, LpTokenWithBalance>; count: 0 }

export const LP_TOKENS_WITH_BALANCES_DEFAULT_STATE: () => LpTokensWithBalancesState = () => ({ tokens: {}, count: 0 })

export const lpTokensWithBalancesAtom = atom<LpTokensWithBalancesState>(LP_TOKENS_WITH_BALANCES_DEFAULT_STATE())
