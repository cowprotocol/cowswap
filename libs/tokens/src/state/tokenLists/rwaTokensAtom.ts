import { atom } from 'jotai'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { listsStatesByChainAtom } from './tokenListsStateAtom'

import { isRwaTokenListSource } from '../../const/tokensLists'
import { ListState } from '../../types'
import { environmentAtom } from '../environmentAtom'

export type RwaToken = ListState['list']['tokens'][number]

/**
 * Tokens of the RWA lists on the current chain, by address key.
 * Built from stored lists rather than `listsStatesMapAtom`, which drops the lists a widget integrator
 * has not selected: RWA rules must still apply to those tokens.
 */
export const rwaTokensAtom = atom(async (get): Promise<Map<string, RwaToken>> => {
  const { chainId } = get(environmentAtom)
  const chainListsStates = (await get(listsStatesByChainAtom))[chainId]
  const tokens = new Map<string, RwaToken>()

  if (!chainListsStates) return tokens

  for (const [source, state] of Object.entries(chainListsStates)) {
    if (state === 'deleted' || !isRwaTokenListSource(source)) continue

    for (const token of state.list.tokens) {
      if (token.chainId !== chainId) continue

      tokens.set(getAddressKey(token.address), token)
    }
  }

  return tokens
})
