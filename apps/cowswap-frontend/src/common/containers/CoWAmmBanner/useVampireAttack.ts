import { useMemo } from 'react'

import { LP_TOKEN_LIST_COW_AMM_ONLY, useAllLpTokens } from '@cowprotocol/tokens'
import { LpTokenProvider } from '@cowprotocol/types'

import { useLpTokensWithBalances, usePoolsInfo } from 'modules/yield/shared'

import { TokenWithAlternative, VampireAttackContext } from './types'

import { useSafeMemoObject } from '../../hooks/useSafeMemo'

// TODO
const POOLS_AVERAGE_DATA_MOCK: Partial<Record<LpTokenProvider, { apy: number }>> = {
  [LpTokenProvider.COW_AMM]: {
    apy: 7.3,
  },
  [LpTokenProvider.UNIV2]: {
    apy: 3.1,
  },
  [LpTokenProvider.CURVE]: {
    apy: 0.4,
  },
  [LpTokenProvider.PANCAKE]: {
    apy: 0.2,
  },
  [LpTokenProvider.SUSHI]: {
    apy: 0.41,
  },
}

export function useVampireAttack(): VampireAttackContext {
  const { tokens: lpTokensWithBalances, count: lpTokensWithBalancesCount } = useLpTokensWithBalances()
  const cowAmmLpTokens = useAllLpTokens(LP_TOKEN_LIST_COW_AMM_ONLY)
  const poolsInfo = usePoolsInfo()
  const alternatives = useMemo(() => {
    if (lpTokensWithBalancesCount === 0) return null

    return Object.keys(lpTokensWithBalances)
      .reduce((acc, tokenAddress) => {
        const lpToken = lpTokensWithBalances[tokenAddress].token
        const alternative = cowAmmLpTokens.find((cowAmmLpToken) => {
          return cowAmmLpToken.tokens.every((token) => lpToken.tokens.includes(token))
        })

        if (alternative) {
          const tokenPoolInfo = poolsInfo?.[lpToken.address.toLowerCase()]?.info
          const alternativePoolInfo = poolsInfo?.[alternative.address.toLowerCase()]?.info

          // When CoW AMM pool has better APY
          if (alternativePoolInfo?.apy && tokenPoolInfo?.apy && alternativePoolInfo.apy > tokenPoolInfo.apy) {
            acc.push({
              token: lpToken,
              alternative,
              tokenPoolInfo,
              alternativePoolInfo,
            })
          }
        }

        return acc
      }, [] as TokenWithAlternative[])
      .sort((a, b) => {
        if (!b.tokenPoolInfo || !a.tokenPoolInfo) return 0

        return b.tokenPoolInfo.apy - a.tokenPoolInfo.apy
      })
  }, [lpTokensWithBalancesCount, lpTokensWithBalances, cowAmmLpTokens, poolsInfo])

  const averageApy = useMemo(() => {
    const keys = Object.keys(POOLS_AVERAGE_DATA_MOCK)

    return (
      keys.reduce((result, _key) => {
        const key = _key as LpTokenProvider

        if (key === LpTokenProvider.COW_AMM) return result

        const pool = POOLS_AVERAGE_DATA_MOCK[key]

        return result + (pool?.apy || 0)
      }, 0) / keys.length
    )
  }, [alternatives])

  const { [LpTokenProvider.COW_AMM]: cowAmmData, ...poolsAverageData } = POOLS_AVERAGE_DATA_MOCK
  const averageApyDiff = cowAmmData ? +(cowAmmData.apy - averageApy).toFixed(2) : 0

  return useSafeMemoObject({
    alternatives,
    cowAmmLpTokensCount: cowAmmLpTokens.length,
    poolsAverageData,
    averageApyDiff,
  })
}
