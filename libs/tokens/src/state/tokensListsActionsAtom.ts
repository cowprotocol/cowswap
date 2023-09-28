import { atom } from 'jotai'
import { nanoid } from '@reduxjs/toolkit'

import { tokensListsEnvironmentAtom } from './tokensListsEnvironmentAtom'
import { activeTokenListsIdsAtom, userAddedTokenListsAtom } from './tokensListsStateAtom'

export const addTokenListAtom = atom(null, (get, set, tokenList: { ensName: string } | { url: string }) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const userAddedTokenLists = get(userAddedTokenListsAtom)
  const activeTokenListsIds = get(activeTokenListsIdsAtom)
  const id = nanoid()

  set(userAddedTokenListsAtom, {
    ...userAddedTokenLists,
    [chainId]: userAddedTokenLists[chainId].concat({ ...tokenList, id }),
  })

  set(activeTokenListsIdsAtom, {
    ...activeTokenListsIds,
    [chainId]: {
      ...activeTokenListsIds[chainId],
      [id]: true,
    },
  })
})
