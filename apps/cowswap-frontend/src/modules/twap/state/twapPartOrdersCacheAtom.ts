import { atom } from 'jotai'

import { deepEqual } from '@cowprotocol/common-utils'
import { atomWithIdbStorage } from '@cowprotocol/core'
import { getAddressKey, EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'

export interface TwapPartOrderCacheEntry {
  twapOrderId: string
  enrichedOrder: EnrichedOrder
}

export type TwapPartOrdersCache = Record<string, TwapPartOrdersCacheByUid>
export type TwapPartOrdersCacheByUid = Record<string, TwapPartOrderCacheEntry>

export interface UpdateTwapPartOrdersCachePayload {
  chainId: SupportedChainId
  owner: string
  entries: TwapPartOrdersCacheByUid
}

export const twapPartOrdersCacheAtom = atomWithIdbStorage<TwapPartOrdersCache>('twapPartOrdersCache:v0', {})

export const updateTwapPartOrdersCacheAtom = atom(null, async (get, set, payload: UpdateTwapPartOrdersCachePayload) => {
  const { chainId, owner, entries } = payload
  const key = `${chainId}:${getAddressKey(owner)}`
  const currentState = await get(twapPartOrdersCacheAtom)
  const currentScopedState = currentState[key] || {}
  const nextScopedState = {
    ...currentScopedState,
    ...entries,
  }

  if (deepEqual(currentScopedState, nextScopedState)) return

  await set(twapPartOrdersCacheAtom, {
    ...currentState,
    [key]: nextScopedState,
  })
})
