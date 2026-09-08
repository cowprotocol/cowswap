import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getAddress } from 'viem'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getJotaiMergerStorage } from '@cowprotocol/core'
import { getAddressKey, mapSupportedNetworks } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'
import { PersistentStateByChain } from '@cowprotocol/types'

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
          acc[getAddressKey(token.address)] = token
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
    // Important! We need to remove the token from the state using the original, lowercase and
    // checksummed address, because state might be spoiled with mixed case (EVM) addresses
    delete stateCopy[token]
    delete stateCopy[getAddressKey(token)]
    delete stateCopy[token.toLowerCase()]
    try {
      delete stateCopy[getAddress(token as `0x${string}`)]
    } catch {}
  })

  set(userAddedTokensAtom, {
    ...userAddedTokensState,
    [chainId]: stateCopy,
  })
})

export const removeUserTokenAtom = atom(null, (get, set, token: TokenWithLogo) => {
  set(removeUserTokensAtom, [token.address])
})

export const resetUserTokensAtom = atom(null, (get, set) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokensState = get(userAddedTokensAtom)

  set(userAddedTokensAtom, {
    ...userAddedTokensState,
    [chainId]: {},
  })
})
