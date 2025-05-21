import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getJotaiMergerStorage } from '@cowprotocol/core'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'
import { Token } from '@uniswap/sdk-core'

import { TokensMap } from '../../types'
import { environmentAtom } from '../environmentAtom'

export const userAddedTokensAtom = atomWithStorage<PersistentStateByChain<TokensMap>>(
  'userAddedTokensAtom:v1',
  mapSupportedNetworks({}),
  getJotaiMergerStorage(),
)

export const userAddedTokensListAtom = atom((get) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokensState = get(userAddedTokensAtom)
  const userAddedTokenStateForChain = userAddedTokensState[chainId] || {}

  return Object.values(userAddedTokenStateForChain).map((token) => TokenWithLogo.fromToken(token, token.logoURI))
})

export const addUserTokenAtom = atom(null, (get, set, tokens: TokenWithLogo[]) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokensState = get(userAddedTokensAtom)

  set(userAddedTokensAtom, {
    ...userAddedTokensState,
    [chainId]: {
      ...userAddedTokensState[chainId],
      ...tokens.reduce<{ [key: string]: Token }>((acc, token) => {
        if (token.chainId === chainId) {
          // Only add token if its chainId matches the current chainId
          acc[token.address.toLowerCase()] = token
        }
        return acc
      }, {}),
    },
  })
})

export const removeUserTokensAtom = atom(null, (get, set, tokens: string[]) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokensState = get(userAddedTokensAtom)
  const stateCopy = { ...userAddedTokensState[chainId] }

  tokens.forEach((token) => {
    delete stateCopy[token.toLowerCase()]
  })

  set(userAddedTokensAtom, {
    ...userAddedTokensState,
    [chainId]: stateCopy,
  })
})

export const removeUserTokenAtom = atom(null, (get, set, token: TokenWithLogo) => {
  set(removeUserTokensAtom, [token.address.toLowerCase()])
})

export const resetUserTokensAtom = atom(null, (get, set) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokensState = get(userAddedTokensAtom)

  set(userAddedTokensAtom, {
    ...userAddedTokensState,
    [chainId]: {},
  })
})
