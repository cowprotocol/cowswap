import { useMemo } from 'react'

import { LpToken } from '@cowprotocol/common-const'
import { LP_TOKEN_LIST_COW_AMM_ONLY, useAllLpTokens } from '@cowprotocol/tokens'

import { useLpTokensWithBalances } from 'modules/yield/shared'

export interface TokenWithAlternative {
  token: LpToken
  alternative: LpToken
}

export function useVampireAttack() {
  const { tokens: lpTokensWithBalances, count: lpTokensWithBalancesCount } = useLpTokensWithBalances()
  const cowAmmLpTokens = useAllLpTokens(LP_TOKEN_LIST_COW_AMM_ONLY)

  return useMemo(() => {
    if (lpTokensWithBalancesCount === 0) return null

    return Object.keys(lpTokensWithBalances).reduce((acc, tokenAddress) => {
      const lpToken = lpTokensWithBalances[tokenAddress].token
      const alternative = cowAmmLpTokens.find((cowAmmLpToken) => {
        return cowAmmLpToken.tokens.every((token) => lpToken.tokens.includes(token))
      })

      if (alternative) {
        acc.push({
          token: lpToken,
          alternative,
        })
      }

      return acc
    }, [] as TokenWithAlternative[])
  }, [lpTokensWithBalancesCount, lpTokensWithBalances, cowAmmLpTokens])
}
