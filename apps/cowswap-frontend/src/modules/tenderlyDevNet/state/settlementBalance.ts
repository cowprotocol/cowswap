import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { GetSettlementBalanceCacheParams, StoreSettlementBalanceCacheParams } from '../types'

export const settlementBalanceCacheAtom = atomWithStorage<Record<string, string>>(
  'settlementBalanceTenderlyDevNet:v1',
  {},
)

export const storeSettlementBalanceCacheAtom = atom(null, (get, set, params: StoreSettlementBalanceCacheParams) => {
  const key = buildKey(params)

  console.log({ key, balance: params.balance })
  set(settlementBalanceCacheAtom, (permitCache) => ({ ...permitCache, [key]: params.balance }))
})

export const getSettlementBalanceCacheAtom = atom(null, (get, set, params: GetSettlementBalanceCacheParams) => {
  const permitCache = get(settlementBalanceCacheAtom)
  const key = buildKey(params)
  return permitCache[key]
})

function buildKey({ chainId, tokenAddress }: GetSettlementBalanceCacheParams) {
  return `${chainId}-${tokenAddress.toLowerCase()}`
}
