import { atom } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  listsEnabledStateAtom,
  listsStatesByChainAtom,
  listsStatesMapAtom,
  userAddedListsSourcesAtom,
} from './tokenListsStateAtom'

import { ListState } from '../../types'
import { environmentAtom } from '../environmentAtom'

export const upsertListsAtom = atom(null, (get, set, chainId: SupportedChainId, listsStates: ListState[]) => {
  const globalState = get(listsStatesByChainAtom)
  const chainState = globalState[chainId]

  const update = listsStates.reduce<{ [listId: string]: ListState }>((acc, list) => {
    acc[list.source] = {
      ...list,
      isEnabled: typeof list.isEnabled === 'boolean' ? list.isEnabled : chainState?.[list.source]?.isEnabled,
    }

    return acc
  }, {})

  set(listsStatesByChainAtom, {
    ...globalState,
    [chainId]: {
      ...chainState,
      ...update,
    },
  })
})
export const addListAtom = atom(null, (get, set, state: ListState) => {
  const { chainId, widgetAppCode } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)
  const userAddedTokenListsForChain = userAddedTokenLists[chainId] || []

  state.isEnabled = true

  if (widgetAppCode) {
    state.widgetAppCode = widgetAppCode
  }

  set(userAddedListsSourcesAtom, {
    ...userAddedTokenLists,
    [chainId]: userAddedTokenListsForChain.concat({
      widgetAppCode: state.widgetAppCode,
      priority: state.priority,
      source: state.source,
    }),
  })

  set(upsertListsAtom, chainId, [state])
})

export const removeListAtom = atom(null, (get, set, source: string) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)
  const userAddedTokenListsForChain = userAddedTokenLists[chainId] || []

  set(userAddedListsSourcesAtom, {
    ...userAddedTokenLists,
    [chainId]: userAddedTokenListsForChain.filter((item) => item.source !== source),
  })

  const stateCopy = { ...get(listsStatesByChainAtom) }

  const networkState = stateCopy[chainId]

  if (networkState) {
    delete networkState[source]
  }

  set(listsStatesByChainAtom, stateCopy)
})

export const toggleListAtom = atom(null, (get, set, source: string) => {
  const { chainId } = get(environmentAtom)
  const listsEnabledState = get(listsEnabledStateAtom)
  const states = get(listsStatesMapAtom)

  if (!states[source]) return

  const list = { ...states[source] }

  list.isEnabled = !listsEnabledState[source]

  set(upsertListsAtom, chainId, [list])
})
