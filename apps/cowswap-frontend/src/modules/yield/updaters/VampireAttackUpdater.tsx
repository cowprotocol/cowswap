import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { LP_TOKEN_LIST_COW_AMM_ONLY, useAllLpTokens } from '@cowprotocol/tokens'
import { LpTokenProvider } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLpTokensWithBalances, usePoolsInfo } from 'modules/yield/shared'
import { POOLS_AVERAGE_DATA_MOCK } from 'modules/yield/updaters/PoolsInfoUpdater/mockPoolInfo'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
import { areLpBalancesLoadedAtom } from 'common/updaters/LpBalancesAndAllowancesUpdater'

import { vampireAttackAtom } from '../state/vampireAttackAtom'
import { TokenWithAlternative, TokenWithSuperiorAlternative } from '../types'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function VampireAttackUpdater(): null {
  const { account } = useWalletInfo()
  const { tokens: lpTokensWithBalances, count: lpTokensWithBalancesCount } = useLpTokensWithBalances()
  const cowAmmLpTokens = useAllLpTokens(LP_TOKEN_LIST_COW_AMM_ONLY)
  const poolsInfo = usePoolsInfo()
  const areLpBalancesLoaded = useAtomValue(areLpBalancesLoadedAtom)
  const setVampireAttack = useSetAtom(vampireAttackAtom)

  const alternativesResult = useMemo(() => {
    if (lpTokensWithBalancesCount === 0) return null

    const result = Object.keys(lpTokensWithBalances).reduce(
      // TODO: Reduce function complexity by extracting logic
      // eslint-disable-next-line complexity
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
            acc.alternatives.push({
              token: lpToken,
              alternative,
              tokenBalance,
            })
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

        return +bBalance.sub(aBalance).toString()
      }),
    }
  }, [lpTokensWithBalancesCount, lpTokensWithBalances, cowAmmLpTokens, poolsInfo])

  const averageApy = useMemo(() => {
    const keys = Object.keys(POOLS_AVERAGE_DATA_MOCK)
    let count = 0

    return (
      keys.reduce((result, _key) => {
        const key = _key as LpTokenProvider

        if (key === LpTokenProvider.COW_AMM) return result

        count++
        const pool = POOLS_AVERAGE_DATA_MOCK[key]

        return result + (pool?.apy || 0)
      }, 0) / count
    )
  }, [])

  const { [LpTokenProvider.COW_AMM]: cowAmmData, ...poolsAverageData } = POOLS_AVERAGE_DATA_MOCK
  const averageApyDiff = cowAmmData ? +(cowAmmData.apy - averageApy).toFixed(2) : 0

  const context = useSafeMemoObject({
    superiorAlternatives: alternativesResult?.superiorAlternatives || null,
    alternatives: alternativesResult?.alternatives || null,
    cowAmmLpTokensCount: cowAmmLpTokens.length,
    poolsAverageData,
    averageApyDiff,
  })

  useEffect(() => {
    if (!account || cowAmmLpTokens.length === 0 || !areLpBalancesLoaded) {
      setVampireAttack(null)
    } else {
      setVampireAttack(context)
    }
  }, [account, context, cowAmmLpTokens.length, areLpBalancesLoaded, setVampireAttack])

  return null
}
