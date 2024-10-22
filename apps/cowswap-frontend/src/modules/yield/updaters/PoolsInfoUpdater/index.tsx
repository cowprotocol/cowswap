import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import ms from 'ms.macro'

import { MOCK_POOL_INFO } from './mockPoolInfo'

import { LP_CATEGORY, useLpTokensWithBalances } from '../../hooks/useLpTokensWithBalances'
import { usePoolsInfo } from '../../hooks/usePoolsInfo'
import { upsertPoolsInfoAtom } from '../../state/poolsInfoAtom'
import { TradeType, useTradeTypeInfo } from '../../../trade'
import { LP_TOKEN_LIST_CATEGORIES, useAllLpTokens } from '@cowprotocol/tokens'

const POOL_INFO_CACHE_TIME = ms`1h`

/**
 * The API should return info about requested pools + alternative COW AMM pools
 * When tokenAddresses is null, it should return info about all pools
 */
function fetchPoolsInfo(tokenAddresses: string[] | null) {
  console.log('TODO', tokenAddresses)
  return Promise.resolve(MOCK_POOL_INFO)
}

export function PoolsInfoUpdater() {
  const poolsInfo = usePoolsInfo()
  const upsertPoolsInfo = useSetAtom(upsertPoolsInfoAtom)
  const tradeTypeInfo = useTradeTypeInfo()
  const isYield = tradeTypeInfo?.tradeType === TradeType.YIELD

  const lpTokensWithBalances = useLpTokensWithBalances()

  const tokensToUpdate = useMemo(() => {
    return lpTokensWithBalances
      ? Object.keys(lpTokensWithBalances).filter((address) => {
          const state = poolsInfo?.[address]

          if (!state) return true

          return state.updatedAt + POOL_INFO_CACHE_TIME > Date.now()
        })
      : null
  }, [lpTokensWithBalances, poolsInfo])

  const tokensKey = useMemo(() => tokensToUpdate?.join(','), [tokensToUpdate])

  useEffect(() => {
    if ((tokensToUpdate && tokensToUpdate.length > 0) || isYield) {
      fetchPoolsInfo(isYield ? null : tokensToUpdate).then(upsertPoolsInfo)
    }
  }, [isYield, tokensKey])

  return null
}
