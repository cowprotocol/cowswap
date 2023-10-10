import { atom } from 'jotai'
import { nanoid } from '@reduxjs/toolkit'

import { environmentAtom } from '../environmentAtom'
import {
  activeTokenListsIdsAtom,
  activeTokenListsMapAtom,
  removeListFromAllTokenListsInfoAtom,
  upsertAllTokenListsInfoAtom,
  userAddedTokenListsAtom,
} from './tokenListsStateAtom'
import { TokenListInfo } from '../../types'

export const addTokenListAtom = atom(null, (get, set, tokenList: TokenListInfo) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedTokenListsAtom)
  const activeTokenListsIds = get(activeTokenListsIdsAtom)
  const id = nanoid()

  tokenList.id = id

  set(userAddedTokenListsAtom, {
    ...userAddedTokenLists,
    [chainId]: userAddedTokenLists[chainId].concat({ ...tokenList.source, id }),
  })

  set(activeTokenListsIdsAtom, {
    ...activeTokenListsIds,
    [chainId]: {
      ...activeTokenListsIds[chainId],
      [id]: true,
    },
  })

  set(upsertAllTokenListsInfoAtom, chainId, { [id]: tokenList })
})

export const removeTokenListAtom = atom(null, (get, set, id: string) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedTokenListsAtom)
  const activeTokenListsIds = get(activeTokenListsIdsAtom)
  const activeTokenListsState = { ...activeTokenListsIds[chainId] }

  delete activeTokenListsState[id]

  set(userAddedTokenListsAtom, {
    ...userAddedTokenLists,
    [chainId]: userAddedTokenLists[chainId].filter((item) => item.id !== id),
  })

  set(activeTokenListsIdsAtom, {
    ...activeTokenListsIds,
    [chainId]: activeTokenListsState,
  })

  set(removeListFromAllTokenListsInfoAtom, id)
})

export const toggleListAtom = atom(null, (get, set, id: string) => {
  const { chainId } = get(environmentAtom)
  const activeTokenListsIds = get(activeTokenListsIdsAtom)
  const activeTokenListsMap = get(activeTokenListsMapAtom)

  const activeTokenListsState = { ...activeTokenListsIds[chainId] }

  activeTokenListsState[id] = !activeTokenListsMap[id]

  set(activeTokenListsIdsAtom, {
    ...activeTokenListsIds,
    [chainId]: activeTokenListsState,
  })
})
