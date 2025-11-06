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
import { environmentAtom } from '../environmentAtom'

import type { ListState } from '../../types'

function ensureListMarkedAsRemoved(
  set: Setter,
  chainId: SupportedChainId,
  sourceLowerCase: string,
): void {
  set(removedListsSourcesAtom, (prev) => {
    const listsForChain = prev[chainId] || []

    if (listsForChain.includes(sourceLowerCase)) return prev

    return {
      ...prev,
      [chainId]: [...listsForChain, sourceLowerCase],
    }
  })
}

function clearRemovedListState(
  set: Setter,
  chainId: SupportedChainId,
  sourceLowerCase: string,
): void {
  set(removedListsSourcesAtom, (prev) => {
    const listsForChain = prev[chainId] || []

    if (!listsForChain.includes(sourceLowerCase)) return prev

    return {
      ...prev,
      [chainId]: listsForChain.filter((item) => item !== sourceLowerCase),
    }
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

  const hasExistingEntry = userAddedTokenListsForChain.some(
    (list) => list.source.toLowerCase() === sourceLowerCase,
  )
  const nextUserAddedListsForChain = hasExistingEntry
    ? userAddedTokenListsForChain.map((list) =>
        list.source.toLowerCase() === sourceLowerCase
          ? {
              ...list,
              priority: state.priority,
              widgetAppCode: state.widgetAppCode,
              lpTokenProvider: state.lpTokenProvider ?? list.lpTokenProvider,
            }
          : list,
      )
    : userAddedTokenListsForChain.concat({
        source: state.source,
        priority: state.priority,
        widgetAppCode: state.widgetAppCode,
        lpTokenProvider: state.lpTokenProvider,
      })

  set(userAddedListsSourcesAtom, {
    ...userAddedTokenLists,
    [chainId]: nextUserAddedListsForChain,
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
  const sourceLowerCase = source.toLowerCase()
  const isUserAddedList = userAddedTokenListsForChain.some(
    (item) => item.source.toLowerCase() === sourceLowerCase,
  )

  set(userAddedListsSourcesAtom, (prev) => {
    const currentForChain = prev[chainId] || []

    return {
      ...prev,
      [chainId]: currentForChain.filter((item) => item.source.toLowerCase() !== sourceLowerCase),
    }
  })

  const stateCopy = { ...(await get(listsStatesByChainAtom)) }
  const networkState = { ...(stateCopy[chainId] || {}) }

  const networkKeyToRemove = Object.keys(networkState).find((key) => key.toLowerCase() === sourceLowerCase)

  if (networkKeyToRemove) {
    delete networkState[networkKeyToRemove]
  }

  if (Object.keys(networkState).length === 0) {
    delete stateCopy[chainId]
  } else {
    stateCopy[chainId] = networkState
  }

  set(listsStatesByChainAtom, stateCopy)

  if (isUserAddedList) {
    if (isPredefinedListSource(get, chainId, sourceLowerCase)) {
      ensureListMarkedAsRemoved(set, chainId, sourceLowerCase)
    } else {
      clearRemovedListState(set, chainId, sourceLowerCase)
    }

    return
  }

  ensureListMarkedAsRemoved(set, chainId, sourceLowerCase)
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
