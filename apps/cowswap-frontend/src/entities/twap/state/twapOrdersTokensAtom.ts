import { atom } from 'jotai'
import { loadable } from 'jotai/utils'

import { tokensByAddressAtom } from '@cowprotocol/tokens'
import type { TokensByAddress } from '@cowprotocol/tokens'

import { getTokensListFromOrders } from 'modules/orders'

import { fetchTokens } from 'common/state/fetchTokens.utils'

import { twapOrdersListAtom } from './twapOrdersListAtom'

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

export const twapOrdersTokensAtom = atom((get): TokensByAddress | null => {
  const loadableState = get(twapOrdersTokensLoadableAtom)
  return loadableState.state === 'hasData' ? loadableState.data : null
})
