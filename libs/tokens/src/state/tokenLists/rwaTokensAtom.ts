import { atom } from 'jotai'

import { getTokenId, TokenId } from '@cowprotocol/cow-sdk'

import { listsStatesByChainAtom } from './tokenListsStateAtom'

import { isRwaTokenListSource } from '../../const/tokensLists'
import { ListState } from '../../types'

export type RwaToken = ListState['list']['tokens'][number]

/**
 * Tokens of the RWA lists on every chain, by token id.
 * Not limited to the current chain: a cross-chain swap buys a token on the destination chain.
 * Built from stored lists rather than `listsStatesMapAtom`, which drops the lists a widget integrator
 * has not selected: RWA rules must still apply to those tokens.
 */
export const rwaTokensAtom = atom(async (get): Promise<Map<TokenId, RwaToken>> => {
  const listsStatesByChain = await get(listsStatesByChainAtom)
  const tokens = new Map<TokenId, RwaToken>()

  for (const chainListsStates of Object.values(listsStatesByChain)) {
    if (!chainListsStates) continue

    for (const [source, state] of Object.entries(chainListsStates)) {
      if (state === 'deleted' || !isRwaTokenListSource(source)) continue

      for (const token of state.list.tokens) {
        tokens.set(getTokenId({ chainId: token.chainId, address: token.address }), token)
      }
    }
  }

  return tokens
})
