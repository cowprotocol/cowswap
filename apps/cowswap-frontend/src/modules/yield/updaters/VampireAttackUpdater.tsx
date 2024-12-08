import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { BFF_BASE_URL, SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { LP_TOKEN_LIST_COW_AMM_ONLY, useAllLpTokens } from '@cowprotocol/tokens'
import { LpTokenProvider } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useLpTokensWithBalances, usePoolsInfo } from 'modules/yield/shared'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
import { areLpBalancesLoadedAtom } from 'common/updaters/LpBalancesAndAllowancesUpdater'

import { vampireAttackAtom } from '../state/vampireAttackAtom'
import { TokenWithAlternative, TokenWithSuperiorAlternative } from '../types'

const lpProviderNameMap: Record<string, LpTokenProvider> = {
  'CoW AMM': LpTokenProvider.COW_AMM,
  uniswap: LpTokenProvider.UNIV2,
  pancakeswap: LpTokenProvider.PANCAKE,
  curve: LpTokenProvider.CURVE,
  sushiswap: LpTokenProvider.SUSHI,
  balancer: LpTokenProvider.BALANCERV2,
}

export function VampireAttackUpdater(): null {
  const { account, chainId } = useWalletInfo()
  const { tokens: lpTokensWithBalances, count: lpTokensWithBalancesCount } = useLpTokensWithBalances()
  const cowAmmLpTokens = useAllLpTokens(LP_TOKEN_LIST_COW_AMM_ONLY)
  const poolsInfo = usePoolsInfo()
  const areLpBalancesLoaded = useAtomValue(areLpBalancesLoadedAtom)
  const setVampireAttack = useSetAtom(vampireAttackAtom)
  const { data: poolsAverageApr } = useSWR(
    [chainId, 'getPoolsAverageApr'],
    async ([chainId]) => {
      // TODO: use BFF_BASE_URL
      const result: Record<string, number> = await fetch(`${BFF_BASE_URL}/${chainId}/yield/getPoolsAverageApr`).then(
        (res) => res.json(),
      )

      return Object.keys(result).reduce(
        (acc, key) => {
          const provider = lpProviderNameMap[key]

          if (provider) {
            acc[provider] = result[key]
          }

          return acc
        },
        {} as Record<LpTokenProvider, number>,
      )
    },
    SWR_NO_REFRESH_OPTIONS,
  )

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
          if (alternativePoolInfo?.apr && tokenPoolInfo?.apr && alternativePoolInfo.apr > tokenPoolInfo.apr) {
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

        return b.tokenPoolInfo.apr - a.tokenPoolInfo.apr
      }),
      alternatives: result.alternatives.sort((a, b) => {
        const aBalance = lpTokensWithBalances[a.token.address.toLowerCase()].balance
        const bBalance = lpTokensWithBalances[b.token.address.toLowerCase()].balance

        return +bBalance.sub(aBalance).toString()
      }),
    }
  }, [lpTokensWithBalancesCount, lpTokensWithBalances, cowAmmLpTokens, poolsInfo])

  const averageApy = useMemo(() => {
    if (!poolsAverageApr) return 0

    const keys = Object.keys(poolsAverageApr)
    let count = 0

    return (
      keys.reduce((result, _key) => {
        const key = _key as LpTokenProvider

        if (key === LpTokenProvider.COW_AMM) return result

        count++
        const poolApr = poolsAverageApr[key]

        return result + (poolApr || 0)
      }, 0) / count
    )
  }, [poolsAverageApr])

  const { [LpTokenProvider.COW_AMM]: cowAmmApr, ...otherPoolsAverageData } = poolsAverageApr || {}
  const averageAprDiff = cowAmmApr ? +(cowAmmApr - averageApy).toFixed(2) : 0

  const context = useSafeMemoObject({
    superiorAlternatives: alternativesResult?.superiorAlternatives || null,
    alternatives: alternativesResult?.alternatives || null,
    cowAmmLpTokensCount: cowAmmLpTokens.length,
    poolsAverageData: otherPoolsAverageData,
    averageAprDiff,
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
