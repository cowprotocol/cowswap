import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import ms from 'ms.macro'

import { TradeType, useTradeTypeInfo } from 'modules/trade'

import { MOCK_POOL_INFO } from './mockPoolInfo'

import { useLpTokensWithBalances } from '../../hooks/useLpTokensWithBalances'
import { usePoolsInfo } from '../../hooks/usePoolsInfo'
import { upsertPoolsInfoAtom } from '../../state/poolsInfoAtom'

const POOL_INFO_CACHE_TIME = ms`1h`

/**
 * The API should return info about requested pools + alternative COW AMM pools
 * When tokenAddresses is null, it should return info about all pools
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function fetchPoolsInfo(tokenAddresses: string[] | null) {
  console.log('TODO', tokenAddresses)
  return Promise.resolve(MOCK_POOL_INFO)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PoolsInfoUpdater() {
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

  useEffect(() => {
    if (tokensToUpdate.length > 0 || isYield) {
      fetchPoolsInfo(isYield ? null : tokensToUpdate).then(upsertPoolsInfo)
    }
    // To avoid excessive recalculations we use tokensKey instead of tokensToUpdate in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYield, tokensKey, upsertPoolsInfo])

  return null
}
