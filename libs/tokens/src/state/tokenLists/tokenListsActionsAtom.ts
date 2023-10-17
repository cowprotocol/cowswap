import { atom } from 'jotai'
import { nanoid } from '@reduxjs/toolkit'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { environmentAtom } from '../environmentAtom'
import {
  listsEnabledStateAtom,
  listsStatesByChainAtom,
  listsStatesMapAtom,
  userAddedListsSourcesAtom,
} from './tokenListsStateAtom'
import { ListState } from '../../types'

export const upsertListsAtom = atom(null, (get, set, chainId: SupportedChainId, listsStates: ListState[]) => {
  const globalState = get(listsStatesByChainAtom)
  const chainState = globalState[chainId]

  const update = listsStates.reduce<{ [listId: string]: ListState }>((acc, list) => {
    acc[list.id] = {
      ...list,
      isEnabled: typeof list.isEnabled === 'boolean' ? list.isEnabled : chainState[list.id]?.isEnabled,
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
  const { chainId } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)
  const id = nanoid()

  state.id = id
  state.isEnabled = true

  set(userAddedListsSourcesAtom, {
    ...userAddedTokenLists,
    [chainId]: userAddedTokenLists[chainId].concat({ id, ...state.source }),
  })

  set(upsertListsAtom, chainId, [state])
})

export const removeListAtom = atom(null, (get, set, id: string) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)

  set(userAddedListsSourcesAtom, {
    ...userAddedTokenLists,
    [chainId]: userAddedTokenLists[chainId].filter((item) => item.id !== id),
  })

  const stateCopy = { ...get(listsStatesByChainAtom) }

  delete stateCopy[chainId][id]

  set(listsStatesByChainAtom, stateCopy)
})

export const toggleListAtom = atom(null, (get, set, id: string) => {
  const { chainId } = get(environmentAtom)
  const listsEnabledState = get(listsEnabledStateAtom)
  const states = get(listsStatesMapAtom)

  if (!states[id]) return

  const list = { ...states[id] }

  list.isEnabled = !listsEnabledState[id]

  set(upsertListsAtom, chainId, [list])
})
