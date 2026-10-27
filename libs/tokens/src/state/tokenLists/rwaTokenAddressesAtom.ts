import { atom } from 'jotai'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { listsStatesByChainAtom } from './tokenListsStateAtom'

import { RWA_TOKENS_LIST_SOURCES } from '../../const/tokensLists'
import { getSourceAsKey } from '../../hooks/lists/useIsListBlocked'
import { environmentAtom } from '../environmentAtom'

const RWA_TOKENS_LIST_KEYS = new Set<string>(RWA_TOKENS_LIST_SOURCES.map(getSourceAsKey))

/**
 * Address keys of every RWA list token on the current chain.
 * Built from stored lists rather than `listsStatesMapAtom`, for the same reason as the xStocks set:
 * RWA lists can be hidden from the user (they are excluded for US users) while the token itself is
 * still reachable, and whatever depends on "this is an RWA" has to keep holding when it is.
 */
export const rwaTokenAddressesAtom = atom(async (get): Promise<Set<string>> => {
  const { chainId } = get(environmentAtom)
  const chainListsStates = (await get(listsStatesByChainAtom))[chainId]
  const addresses = new Set<string>()

  if (!chainListsStates) return addresses

  for (const [source, state] of Object.entries(chainListsStates)) {
    if (state === 'deleted' || !RWA_TOKENS_LIST_KEYS.has(getSourceAsKey(source))) continue

    for (const token of state.list.tokens) {
      addresses.add(getAddressKey(token.address))
    }
  }

  return addresses
})
