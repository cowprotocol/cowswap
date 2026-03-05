import { atom, SetStateAction, WritableAtom } from 'jotai'

import { deepEqual } from '@cowprotocol/common-utils'
import { atomWithIdbStorage } from '@cowprotocol/core'
import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'

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
type TwapPartOrdersCacheStorageAtom = WritableAtom<
  TwapPartOrdersCache | Promise<TwapPartOrdersCache>,
  [SetStateAction<TwapPartOrdersCache>],
  Promise<void>
>
const twapPartOrdersCacheStorageAtom = twapPartOrdersCacheAtom as unknown as TwapPartOrdersCacheStorageAtom

export const updateTwapPartOrdersCacheAtom = atom(null, async (get, set, payload: UpdateTwapPartOrdersCachePayload) => {
  const { chainId, owner, entries } = payload
  const key = `${chainId}:${owner.toLowerCase()}`
  const currentState = await get(twapPartOrdersCacheStorageAtom)
  const currentScopedState = currentState[key] || {}
  const nextScopedState = {
    ...currentScopedState,
    ...entries,
  }

  if (deepEqual(currentScopedState, nextScopedState)) return

  await set(twapPartOrdersCacheStorageAtom, {
    ...currentState,
    [key]: nextScopedState,
  })
})
