import { fetchWithCache } from '@cowprotocol/common-utils'
import { NativePriceResponse, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import QuickLRU from 'quick-lru'

import * as api from './api'

export * from './api'

const nativePriceCache = new QuickLRU<string, Promise<NativePriceResponse>>({
  maxSize: 1000,
  maxAge: ms`1m`,
})

export async function getNativePrice(chainId: ChainId, currencyAddress: string): Promise<NativePriceResponse> {
  return fetchWithCache({
    key: `${chainId}:${currencyAddress}`,
    fetch: () => api.getNativePrice(chainId, currencyAddress),
    cache: nativePriceCache,
  })
}
