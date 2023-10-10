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
import { FetchedTokenList, TokensMap } from '../../types'
import { addTokensFromImportedListAtom, removeTokensOfListAtom } from '../tokens/tokensAtom'

export const addTokenListAtom = atom(null, (get, set, tokenList: FetchedTokenList) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedTokenListsAtom)
  const activeTokenListsIds = get(activeTokenListsIdsAtom)
  const id = nanoid()
  const { info, tokens } = tokenList

  info.id = id

  set(userAddedTokenListsAtom, {
    ...userAddedTokenLists,
    [chainId]: userAddedTokenLists[chainId].concat({ ...info.source, id }),
  })

  set(activeTokenListsIdsAtom, {
    ...activeTokenListsIds,
    [chainId]: {
      ...activeTokenListsIds[chainId],
      [id]: true,
    },
  })

  set(upsertAllTokenListsInfoAtom, chainId, { [id]: info })

  const tokensMap = tokens.reduce<TokensMap>((acc, token) => {
    if (token.chainId === chainId) {
      acc[token.address.toLowerCase()] = token
    }

    return acc
  }, {})

  set(addTokensFromImportedListAtom, id, tokensMap)
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
  set(removeTokensOfListAtom, id)
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
