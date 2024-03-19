import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokensMap } from '../../types'
import { environmentAtom } from '../environmentAtom'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { Token } from '@uniswap/sdk-core'
import { getJotaiMergerStorage } from '@cowprotocol/core'

export const userAddedTokensAtom = atomWithStorage<Record<SupportedChainId, TokensMap>>(
  'userAddedTokensAtom:v1',
  mapSupportedNetworks({}),
  getJotaiMergerStorage()
)

export const userAddedTokensListAtom = atom((get) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokensState = get(userAddedTokensAtom)

  return Object.values(userAddedTokensState[chainId]).map((token) => TokenWithLogo.fromToken(token, token.logoURI))
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

export const removeUserTokenAtom = atom(null, (get, set, token: TokenWithLogo) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokensState = get(userAddedTokensAtom)
  const stateCopy = { ...userAddedTokensState[chainId] }

  delete stateCopy[token.address.toLowerCase()]

  set(userAddedTokensAtom, {
    ...userAddedTokensState,
    [chainId]: stateCopy,
  })
})

export const resetUserTokensAtom = atom(null, (get, set) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokensState = get(userAddedTokensAtom)

  set(userAddedTokensAtom, {
    ...userAddedTokensState,
    [chainId]: {},
  })
})
