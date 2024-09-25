import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { GetTokenBalanceSlotParams, StoreTokenBalanceSlotParams } from '../types'

export const tokenBalanceSlotCacheAtom = atomWithStorage<Record<string, string>>('tokenBalanceSlot:v1', {})

export const storeTokenBalanceSlotCacheAtom = atom(null, (get, set, params: StoreTokenBalanceSlotParams) => {
  const key = buildKey(params)

  set(tokenBalanceSlotCacheAtom, (permitCache) => ({ ...permitCache, [key]: params.memorySlot }))
})

export const getTokenBalanceSlotCacheAtom = atom(null, (get, set, params: GetTokenBalanceSlotParams) => {
  const permitCache = get(tokenBalanceSlotCacheAtom)
  const key = buildKey(params)
  return permitCache[key]
})

function buildKey({ chainId, tokenAddress }: GetTokenBalanceSlotParams) {
  return `${chainId}-${tokenAddress.toLowerCase()}`
}
