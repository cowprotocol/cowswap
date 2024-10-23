import { useMemo } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { LpToken } from '@cowprotocol/common-const'
import { TokenListCategory, useAllLpTokens } from '@cowprotocol/tokens'
import { BigNumber } from '@ethersproject/bignumber'

export type LpTokenWithBalance = {
  token: LpToken
  balance: BigNumber
}
export const LP_CATEGORY = [TokenListCategory.LP]

export function useLpTokensWithBalances() {
  const lpTokens = useAllLpTokens(LP_CATEGORY)
  const { values: balances } = useTokensBalances()

  return useMemo(() => {
    if (lpTokens.length === 0) return undefined

    return lpTokens.reduce(
      (acc, token) => {
        const addressLower = token.address.toLowerCase()
        const balance = balances[addressLower]

        if (balance && !balance.isZero()) {
          acc[addressLower] = { token, balance }
        }

        return acc
      },
      {} as Record<string, LpTokenWithBalance>,
    )
  }, [lpTokens, balances])
}
