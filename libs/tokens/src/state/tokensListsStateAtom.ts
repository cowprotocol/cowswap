import { atom } from 'jotai'
import { TokenListInfo, TokenListsByNetwork } from '../types'
import { DEFAULT_TOKENS_LISTS } from '../const/tokensLists'
import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { tokensListsEnvironmentAtom } from './tokensListsEnvironmentAtom'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

export const defaultTokensListsAtom = atom<TokenListsByNetwork>(DEFAULT_TOKENS_LISTS)

export const { atom: allTokenListsInfoAtom, updateAtom: updateAllTokenListsInfoAtom } = atomWithPartialUpdate(
  atomWithStorage<Record<SupportedChainId, { [id: string]: TokenListInfo }>>('allTokenListsInfoAtom:v1', {
    [SupportedChainId.MAINNET]: {},
    [SupportedChainId.GNOSIS_CHAIN]: {},
    [SupportedChainId.GOERLI]: {},
  })
)
export const userAddedTokenListsAtom = atomWithStorage<TokenListsByNetwork>('userAddedTokenListsAtom:v1', {
  [SupportedChainId.MAINNET]: [],
  [SupportedChainId.GNOSIS_CHAIN]: [],
  [SupportedChainId.GOERLI]: [],
})

export const activeTokenListsIdsAtom = atomWithStorage<Record<SupportedChainId, { [id: string]: boolean | undefined }>>(
  'activeTokenListsAtom:v1',
  {
    [SupportedChainId.MAINNET]: {},
    [SupportedChainId.GNOSIS_CHAIN]: {},
    [SupportedChainId.GOERLI]: {},
  }
)

export const allTokensListsAtom = atom((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const defaultTokensLists = get(defaultTokensListsAtom)
  const userAddedTokenLists = get(userAddedTokenListsAtom)

  return [...defaultTokensLists[chainId], ...userAddedTokenLists[chainId]]
})

export const activeTokensListsMapAtom = atom((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const allTokensLists = get(allTokensListsAtom)
  const activeTokenLists = get(activeTokenListsIdsAtom)
  const tokenListsActive = activeTokenLists[chainId]

  return allTokensLists.reduce<{ [listId: string]: boolean }>((acc, tokenList) => {
    const isActive = tokenListsActive[tokenList.id]

    acc[tokenList.id] = isActive === false ? false : !!tokenList.enabledByDefault

    return acc
  }, {})
})
