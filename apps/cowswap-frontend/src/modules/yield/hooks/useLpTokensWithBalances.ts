import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { LpToken, SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { TokenListCategory, useAllLpTokens } from '@cowprotocol/tokens'
import { BigNumber } from '@ethersproject/bignumber'

import useSWR from 'swr'

export type LpTokenWithBalance = {
  token: LpToken
  balance: BigNumber
}
export const LP_CATEGORY = [TokenListCategory.LP]

const DEFAULT_STATE = { tokens: {} as Record<string, LpTokenWithBalance>, count: 0 }

export function useLpTokensWithBalances() {
  const lpTokens = useAllLpTokens(LP_CATEGORY)
  const { values: balances } = useTokensBalances()

  return useSWR(
    [lpTokens, balances, 'useLpTokensWithBalances'],
    ([lpTokens, balances]) => {
      if (lpTokens.length === 0) return DEFAULT_STATE

      return lpTokens.reduce(
        (acc, token) => {
          const addressLower = token.address.toLowerCase()
          const balance = balances[addressLower]

          if (balance && !balance.isZero()) {
            acc.count++
            acc.tokens[addressLower] = { token, balance }
          }

          return acc
        },
        { ...DEFAULT_STATE },
      )
    },
    { ...SWR_NO_REFRESH_OPTIONS, fallbackData: DEFAULT_STATE },
  ).data
}
