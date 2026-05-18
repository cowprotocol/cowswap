import { atom } from 'jotai'

import { atomWithIdbStorage } from '@cowprotocol/core'
import { TargetChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_ADDITIONAL_CHAIN_TOKENS_LISTS } from '../../const/additionalChainTokensList'
import { AdditionalChainTokenListsByChainState, ListSourceConfig } from '../../types'

/**
 * Persisted state of additional chain token lists, keyed by TargetChainId.
 * Analogous to listsStatesByChainAtom but for non-EVM (AdditionalTargetChainId) chains.
 */
export const additionalChainTokenListsStateAtom = atomWithIdbStorage<AdditionalChainTokenListsByChainState>(
  'additionalChainTokenListsInfoAtom:v0',
  {},
)

export const additionalChainTokenListsUpdatingAtom = atom<boolean>(false)

export function getAdditionalChainTokenListSources(chainId: TargetChainId): ListSourceConfig[] {
  return DEFAULT_ADDITIONAL_CHAIN_TOKENS_LISTS[chainId] ?? []
}
