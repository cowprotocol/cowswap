import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { BFF_BASE_URL, SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import useSWR from 'swr'

import { TradeType, useTradeTypeInfo } from 'modules/trade'

import { useLpTokensWithBalances } from '../../hooks/useLpTokensWithBalances'
import { usePoolsInfo } from '../../hooks/usePoolsInfo'
import { PoolInfo, upsertPoolsInfoAtom } from '../../state/poolsInfoAtom'

const POOL_INFO_CACHE_TIME = ms`1h`

interface PoolInfoDto {
  apr: number
  chain_id: number
  contract_address: string
  fee: number
  project: string
  tvl: number
  volume: number
}

export function PoolsInfoUpdater() {
  const { chainId } = useWalletInfo()
  const poolsInfo = usePoolsInfo()
  const upsertPoolsInfo = useSetAtom(upsertPoolsInfoAtom)
  const tradeTypeInfo = useTradeTypeInfo()
  const isYield = tradeTypeInfo?.tradeType === TradeType.YIELD

  const { tokens: lpTokensWithBalances } = useLpTokensWithBalances()

  const tokensToUpdate = useMemo(() => {
    return Object.keys(lpTokensWithBalances).filter((address) => {
      const state = poolsInfo?.[address]

      if (!state) return true

      return state.updatedAt + POOL_INFO_CACHE_TIME > Date.now()
    })
  }, [lpTokensWithBalances, poolsInfo])

  const tokensKey = useMemo(() => tokensToUpdate.join(','), [tokensToUpdate])

  const { data: poolsAverageData } = useSWR(
    tokensKey || isYield ? [chainId, tokensToUpdate, 'getPoolsInfo'] : null,
    async ([chainId, tokensToUpdate]) => {
      const results: PoolInfoDto[] = await fetch(`${BFF_BASE_URL}/${chainId}/yield/pools`, {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(tokensToUpdate),
      }).then((res) => res.json())

      return results.reduce(
        (acc, val) => {
          acc[val.contract_address.toLowerCase()] = {
            apr: +val.apr.toFixed(2),
            tvl: +val.tvl.toFixed(2),
            feeTier: val.fee,
            volume24h: +val.volume.toFixed(2),
          }

          return acc
        },
        {} as Record<string, PoolInfo>,
      )
    },
    SWR_NO_REFRESH_OPTIONS,
  )

  useEffect(() => {
    if (!poolsAverageData) return

    upsertPoolsInfo(poolsAverageData)
  }, [poolsAverageData, upsertPoolsInfo])

  return null
}
