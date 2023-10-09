import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokensMap } from '../../types'
import { tokenListsEnvironmentAtom } from '../tokenLists/tokenListsEnvironmentAtom'
import { TokenWithLogo } from '@cowprotocol/common-const'

export const userAddedTokensAtom = atomWithStorage<Record<SupportedChainId, TokensMap>>('userAddedTokensAtom:v1', {
  [SupportedChainId.MAINNET]: {},
  [SupportedChainId.GNOSIS_CHAIN]: {},
  [SupportedChainId.GOERLI]: {},
})

export const userAddedTokensListAtom = atom((get) => {
  const { chainId } = get(tokenListsEnvironmentAtom)
  const userAddedTokensState = get(userAddedTokensAtom)

  return Object.values(userAddedTokensState[chainId]).map(
    (token) => new TokenWithLogo(token.logoURI, token.chainId, token.address, token.decimals, token.symbol, token.name)
  )
})

export const addUserTokenAtom = atom(null, (get, set, token: TokenWithLogo) => {
  const { chainId } = get(tokenListsEnvironmentAtom)
  const userAddedTokensState = get(userAddedTokensAtom)

  set(userAddedTokensAtom, {
    ...userAddedTokensState,
    [chainId]: { ...userAddedTokensState[chainId], [token.address.toLowerCase()]: token },
  })
})

export const removeUserTokenAtom = atom(null, (get, set, token: TokenWithLogo) => {
  const { chainId } = get(tokenListsEnvironmentAtom)
  const userAddedTokensState = get(userAddedTokensAtom)
  const stateCopy = { ...userAddedTokensState[chainId] }

  delete stateCopy[token.address.toLowerCase()]

  set(userAddedTokensAtom, {
    ...userAddedTokensState,
    [chainId]: stateCopy,
  })
})

export const resetUserTokenAtom = atom(null, (get, set) => {
  const { chainId } = get(tokenListsEnvironmentAtom)
  const userAddedTokensState = get(userAddedTokensAtom)

  set(userAddedTokensAtom, {
    ...userAddedTokensState,
    [chainId]: {},
  })
})
