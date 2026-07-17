import { atom, type Getter, type Setter } from 'jotai'
import { loadable } from 'jotai/utils'

import { jotaiStore } from '@cowprotocol/core'
import { tokensByAddressAtom } from '@cowprotocol/tokens'
import type { TokensByAddress } from '@cowprotocol/tokens'

import { observe } from 'jotai-effect'

import { getTokensListFromOrders } from 'modules/orders'

import { twapOrdersListAtom } from './twapOrdersListAtom'

import { fetchTokens } from '../utils/fetchTokens/fetchTokens.utils'

export const twapOrdersTokensAddressesAtom = atom((get) => getTokensListFromOrders(get(twapOrdersListAtom)))

export const twapOrdersTokensAsyncAtom = atom(async (get): Promise<TokensByAddress | null> => {
  // TODO: Why do we read chainId from libs/tokens/src/state/environmentAtom.ts in here?
  const { tokens, chainId } = await get(tokensByAddressAtom)
  const twapOrdersTokensAddresses = get(twapOrdersTokensAddressesAtom)

  // TODO: Before, new tokens would be added using addUserTokenAtom, so the next time they'll be available from
  // tokensByAddressAtom. For now, we can skip that. Once everything's working again, we can consider moving
  // all token-related logic to query atoms. Also, once we do all token fetching using `fetchTokens` and its
  // in-memory caching, we can remove the `tokensByAddressAtom` dependency.
  return fetchTokens(chainId, tokens, twapOrdersTokensAddresses)
})

export const twapOrdersTokensLoadableAtom = loadable(twapOrdersTokensAsyncAtom)

const twapOrdersTokensCacheAtom = atom<TokensByAddress | null>(null)

export function observeTwapOrdersTokensCache(get: Getter, set: Setter): void {
  const loadableState = get(twapOrdersTokensLoadableAtom)

  if (loadableState.state === 'hasData') {
    set(twapOrdersTokensCacheAtom, loadableState.data)
  }
}

// Cache last resolution of `twapOrdersTokensAsyncAtom` / `twapOrdersTokensLoadableAtom` / `twapOrdersTokensCacheAtom`
observe(observeTwapOrdersTokensCache, jotaiStore)

// Return the last current or cached value of `twapOrdersTokensAsyncAtom` / `twapOrdersTokensLoadableAtom` / `twapOrdersTokensCacheAtom`
export const twapOrdersTokensAtom = atom((get): TokensByAddress | null => {
  const loadableState = get(twapOrdersTokensLoadableAtom)

  if (loadableState.state === 'hasData') {
    return loadableState.data
  }

  return get(twapOrdersTokensCacheAtom)
})
