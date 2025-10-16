import { atom, type Getter, type Setter } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  curatedListSourceAtom,
  listsEnabledStateAtom,
  listsStatesByChainAtom,
  listsStatesMapAtom,
  removedListsSourcesAtom,
  userAddedListsSourcesAtom,
} from './tokenListsStateAtom'

import { DEFAULT_TOKENS_LISTS, LP_TOKEN_LISTS } from '../../const/tokensLists'
import { ListState } from '../../types'
import { environmentAtom } from '../environmentAtom'

type RemovedListsState = Record<SupportedChainId, string[]>

function ensureListMarkedAsRemoved(
  set: Setter,
  chainId: SupportedChainId,
  removedLists: RemovedListsState,
  listsForChain: string[],
  sourceLowerCase: string,
): void {
  if (listsForChain.includes(sourceLowerCase)) return

  set(removedListsSourcesAtom, {
    ...removedLists,
    [chainId]: [...listsForChain, sourceLowerCase],
  })
}

function clearRemovedListState(
  set: Setter,
  chainId: SupportedChainId,
  removedLists: RemovedListsState,
  listsForChain: string[],
  sourceLowerCase: string,
): void {
  if (!listsForChain.includes(sourceLowerCase)) return

  set(removedListsSourcesAtom, {
    ...removedLists,
    [chainId]: listsForChain.filter((item) => item !== sourceLowerCase),
  })
}

function isPredefinedListSource(
  get: Getter,
  chainId: SupportedChainId,
  sourceLowerCase: string,
): boolean {
  const curatedLists = get(curatedListSourceAtom)
  const defaultListsForChain = DEFAULT_TOKENS_LISTS[chainId] || []
  const allLists = [...defaultListsForChain, ...curatedLists, ...LP_TOKEN_LISTS]

  return allLists.some((list) => list.source.toLowerCase() === sourceLowerCase)
}

export const upsertListsAtom = atom(null, async (get, set, chainId: SupportedChainId, listsStates: ListState[]) => {
  const globalState = await get(listsStatesByChainAtom)
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
  const removedTokenLists = get(removedListsSourcesAtom)
  const removedTokenListsForChain = removedTokenLists[chainId] || []
  const sourceLowerCase = state.source.toLowerCase()

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

  if (removedTokenListsForChain.includes(sourceLowerCase)) {
    set(removedListsSourcesAtom, {
      ...removedTokenLists,
      [chainId]: removedTokenListsForChain.filter((item) => item !== sourceLowerCase),
    })
  }

  set(upsertListsAtom, chainId, [state])
})

export const removeListAtom = atom(null, async (get, set, source: string) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)
  const userAddedTokenListsForChain = userAddedTokenLists[chainId] || []
  const removedTokenLists = get(removedListsSourcesAtom)
  const removedTokenListsForChain = removedTokenLists[chainId] || []
  const sourceLowerCase = source.toLowerCase()
  const isUserAddedList = userAddedTokenListsForChain.some((item) => item.source === source)

  set(userAddedListsSourcesAtom, {
    ...userAddedTokenLists,
    [chainId]: userAddedTokenListsForChain.filter((item) => item.source !== source),
  })

  const stateCopy = { ...(await get(listsStatesByChainAtom)) }
  const networkState = { ...(stateCopy[chainId] || {}) }

  delete networkState[source]

  if (Object.keys(networkState).length === 0) {
    delete stateCopy[chainId]
  } else {
    stateCopy[chainId] = networkState
  }

  set(listsStatesByChainAtom, stateCopy)

  if (isUserAddedList) {
    if (isPredefinedListSource(get, chainId, sourceLowerCase)) {
      ensureListMarkedAsRemoved(set, chainId, removedTokenLists, removedTokenListsForChain, sourceLowerCase)
    } else {
      clearRemovedListState(set, chainId, removedTokenLists, removedTokenListsForChain, sourceLowerCase)
    }

    return
  }

  ensureListMarkedAsRemoved(set, chainId, removedTokenLists, removedTokenListsForChain, sourceLowerCase)
})

export const toggleListAtom = atom(null, async (get, set, source: string) => {
  const { chainId } = get(environmentAtom)
  const listsEnabledState = await get(listsEnabledStateAtom)
  const states = await get(listsStatesMapAtom)

  if (!states[source]) return

  const list = { ...states[source] }

  list.isEnabled = !listsEnabledState[source]

  set(upsertListsAtom, chainId, [list])
})
