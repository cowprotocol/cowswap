import { useMemo } from 'react'

import { LP_TOKEN_LIST_COW_AMM_ONLY, useAllLpTokens } from '@cowprotocol/tokens'
import { LpTokenProvider } from '@cowprotocol/types'

import { useLpTokensWithBalances, usePoolsInfo } from 'modules/yield/shared'
import { POOLS_AVERAGE_DATA_MOCK } from 'modules/yield/updaters/PoolsInfoUpdater/mockPoolInfo'

import { TokenWithAlternative, TokenWithSuperiorAlternative, VampireAttackContext } from './types'

import { useSafeMemoObject } from '../../hooks/useSafeMemo'

export function useVampireAttack(): VampireAttackContext {
  const { tokens: lpTokensWithBalances, count: lpTokensWithBalancesCount } = useLpTokensWithBalances()
  const cowAmmLpTokens = useAllLpTokens(LP_TOKEN_LIST_COW_AMM_ONLY)
  const poolsInfo = usePoolsInfo()
  const alternativesResult = useMemo(() => {
    if (lpTokensWithBalancesCount === 0) return null

    const result = Object.keys(lpTokensWithBalances).reduce(
      (acc, tokenAddress) => {
        const { token: lpToken, balance: tokenBalance } = lpTokensWithBalances[tokenAddress]
        const alternative = cowAmmLpTokens.find((cowAmmLpToken) => {
          return cowAmmLpToken.tokens.every((token) => lpToken.tokens.includes(token))
        })

        if (alternative) {
          const tokenPoolInfo = poolsInfo?.[lpToken.address.toLowerCase()]?.info
          const alternativePoolInfo = poolsInfo?.[alternative.address.toLowerCase()]?.info

          // When CoW AMM pool has better APY
          if (alternativePoolInfo?.apy && tokenPoolInfo?.apy && alternativePoolInfo.apy > tokenPoolInfo.apy) {
            acc.superiorAlternatives.push({
              token: lpToken,
              alternative,
              tokenPoolInfo,
              alternativePoolInfo,
              tokenBalance,
            })
          } else {
            acc.alternatives.push({ token: lpToken, alternative, tokenBalance })
          }
        }

        return acc
      },
      { superiorAlternatives: [] as TokenWithSuperiorAlternative[], alternatives: [] as TokenWithAlternative[] },
    )

    return {
      superiorAlternatives: result.superiorAlternatives.sort((a, b) => {
        if (!b.tokenPoolInfo || !a.tokenPoolInfo) return 0

        return b.tokenPoolInfo.apy - a.tokenPoolInfo.apy
      }),
      alternatives: result.alternatives.sort((a, b) => {
        const aBalance = lpTokensWithBalances[a.token.address.toLowerCase()].balance
        const bBalance = lpTokensWithBalances[b.token.address.toLowerCase()].balance

        return bBalance.sub(aBalance).toNumber()
      }),
    }
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
  }, [])

  const { [LpTokenProvider.COW_AMM]: cowAmmData, ...poolsAverageData } = POOLS_AVERAGE_DATA_MOCK
  const averageApyDiff = cowAmmData ? +(cowAmmData.apy - averageApy).toFixed(2) : 0

  return useSafeMemoObject({
    superiorAlternatives: alternativesResult?.superiorAlternatives || null,
    alternatives: alternativesResult?.alternatives || null,
    cowAmmLpTokensCount: cowAmmLpTokens.length,
    poolsAverageData,
    averageApyDiff,
  })
}
