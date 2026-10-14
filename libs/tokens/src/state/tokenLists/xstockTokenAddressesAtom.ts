import { atom } from 'jotai'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { listsStatesByChainAtom } from './tokenListsStateAtom'

import { XSTOCKS_TOKENS_LIST_SOURCE } from '../../const/tokensLists'
import { getSourceAsKey } from '../../hooks/lists/useIsListBlocked'
import { environmentAtom } from '../environmentAtom'

const XSTOCKS_TOKENS_LIST_KEY = getSourceAsKey(XSTOCKS_TOKENS_LIST_SOURCE)

/**
 * Address keys of the xStocks list tokens on the current chain.
 * Built from stored lists rather than `listsStatesMapAtom`: the xStocks list can be hidden from the user
 * (e.g. RWA lists excluded for US users), and the xStocks trade minimum must still apply.
 */
export const xstockTokenAddressesAtom = atom(async (get): Promise<Set<string>> => {
  const { chainId } = get(environmentAtom)
  const chainListsStates = (await get(listsStatesByChainAtom))[chainId]
  const addresses = new Set<string>()

  if (!chainListsStates) return addresses

  for (const [source, state] of Object.entries(chainListsStates)) {
    if (state === 'deleted' || getSourceAsKey(source) !== XSTOCKS_TOKENS_LIST_KEY) continue

    for (const token of state.list.tokens) {
      addresses.add(getAddressKey(token.address))
    }
  }

  return addresses
})
