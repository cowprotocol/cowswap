import { atom } from 'jotai'
import { TokenListInfo, TokenListsByNetwork } from '../../types'
import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { tokenListsEnvironmentAtom } from './tokenListsEnvironmentAtom'

const defaultTokensListsAtom = atom<TokenListsByNetwork>(DEFAULT_TOKENS_LISTS)

const allTokenListsInfoByChainAtom = atomWithStorage<Record<SupportedChainId, { [id: string]: TokenListInfo }>>(
  'allTokenListsInfoAtom:v1',
  {
    [SupportedChainId.MAINNET]: {},
    [SupportedChainId.GNOSIS_CHAIN]: {},
    [SupportedChainId.GOERLI]: {},
  }
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

export const allTokenListsInfoAtom = atom((get) => {
  const { chainId } = get(tokenListsEnvironmentAtom)
  const allTokenListsInfo = get(allTokenListsInfoByChainAtom)

  return Object.values(allTokenListsInfo[chainId])
})

export const upsertAllTokenListsInfoAtom = atom(
  null,
  (get, set, chainId: SupportedChainId, update: { [id: string]: TokenListInfo }) => {
    const state = get(allTokenListsInfoByChainAtom)

    set(allTokenListsInfoByChainAtom, {
      ...state,
      [chainId]: {
        ...state[chainId],
        ...update,
      },
    })
  }
)
export const removeListFromAllTokenListsInfoAtom = atom(null, (get, set, id: string) => {
  const { chainId } = get(tokenListsEnvironmentAtom)
  const stateCopy = { ...get(allTokenListsInfoByChainAtom) }

  delete stateCopy[chainId][id]

  set(allTokenListsInfoByChainAtom, stateCopy)
})

export const allTokenListsAtom = atom((get) => {
  const { chainId } = get(tokenListsEnvironmentAtom)
  const defaultTokensLists = get(defaultTokensListsAtom)
  const userAddedTokenLists = get(userAddedTokenListsAtom)

  return [...defaultTokensLists[chainId], ...userAddedTokenLists[chainId]]
})

export const activeTokenListsMapAtom = atom((get) => {
  const { chainId } = get(tokenListsEnvironmentAtom)
  const allTokensLists = get(allTokenListsAtom)
  const activeTokenLists = get(activeTokenListsIdsAtom)
  const tokenListsActive = activeTokenLists[chainId]

  return allTokensLists.reduce<{ [listId: string]: boolean }>((acc, tokenList) => {
    const isActive = tokenListsActive[tokenList.id]

    acc[tokenList.id] = typeof isActive === 'boolean' ? isActive : !!tokenList.enabledByDefault

    return acc
  }, {})
})
