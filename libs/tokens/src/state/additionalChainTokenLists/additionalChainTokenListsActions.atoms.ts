import { atom } from 'jotai'

import { TargetChainId } from '@cowprotocol/cow-sdk'

import { additionalChainTokenListsStateAtom } from './additionalChainTokenListsState.atoms'

import { ListState } from '../../types'

/**
 * Write atom to upsert additional chain token lists into the persisted state.
 * Analogous to upsertListsAtom but for non-supported chains (AdditionalTargetChainId) chains.
 */
export const upsertAdditionalChainListsAtom = atom(
  null,
  async (get, set, chainId: TargetChainId, listsStates: ListState[]) => {
    const globalState = await get(additionalChainTokenListsStateAtom)
    const chainState = globalState[chainId]

    const update = listsStates.reduce<{ [listId: string]: ListState }>((acc, list) => {
      const listState = chainState?.[list.source]
      const defaultEnabledState = listState === 'deleted' ? true : listState?.isEnabled

      acc[list.source] = {
        ...list,
        isEnabled: typeof list.isEnabled === 'boolean' ? list.isEnabled : defaultEnabledState,
      }

      return acc
    }, {})

    set(additionalChainTokenListsStateAtom, {
      ...globalState,
      [chainId]: {
        ...chainState,
        ...update,
      },
    })
  },
)
