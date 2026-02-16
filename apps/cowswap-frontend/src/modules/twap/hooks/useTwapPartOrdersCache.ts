import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { TwapPartOrdersCacheByUid, twapPartOrdersCacheAtom } from '../state/twapPartOrdersCacheAtom'

export const EMPTY_CACHE: TwapPartOrdersCacheByUid = {}

interface UseTwapPartOrdersCacheResult {
  cacheByUid: TwapPartOrdersCacheByUid
  cachedFinalizedTwapOrderIds: Set<string>
}

export function useTwapPartOrdersCache(): UseTwapPartOrdersCacheResult {
  const { chainId, account } = useWalletInfo()
  const twapPartOrdersCache = useAtomValue(twapPartOrdersCacheAtom)

  const cacheByUid = useMemo(() => {
    if (!chainId || !account) return EMPTY_CACHE
    const scopeKey = `${chainId}:${account.toLowerCase()}`
    return twapPartOrdersCache[scopeKey] || EMPTY_CACHE
  }, [chainId, account, twapPartOrdersCache])

  const cachedFinalizedTwapOrderIds = useMemo(() => {
    return Object.values(cacheByUid).reduce<Set<string>>((acc, entry) => {
      acc.add(entry.twapOrderId)
      return acc
    }, new Set<string>())
  }, [cacheByUid])

  return {
    cacheByUid,
    cachedFinalizedTwapOrderIds,
  }
}
