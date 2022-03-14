import DEFAULT_TOKEN_LIST from '@uniswap/default-token-list'
import { TokenList } from '@uniswap/token-lists'
import { useMemo, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from 'state/hooks'
import sortByListPriority from 'utils/listSort'

import BROKEN_LIST from 'constants/tokenLists/broken.tokenlist.json'
import UNSUPPORTED_TOKEN_LIST from 'constants/tokenLists/unsupported.tokenlist.json'
import { AppState } from 'state'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { UNSUPPORTED_LIST_URLS, DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
// MOD
import { useActiveWeb3React } from 'hooks/web3'
import {
  addGpUnsupportedToken,
  AddGpUnsupportedTokenParams,
  RemoveGpUnsupportedTokenParams,
  removeGpUnsupportedToken,
} from '../actions'
import { UnsupportedToken } from 'api/cow'
import { isAddress } from 'utils'
import { SupportedChainId as ChainId } from 'constants/chains'
import { supportedChainId } from 'utils/supportedChainId'
import { TokenAddressMap, combineMaps } from '@src/state/lists/hooks'

/* 
export type TokenAddressMap = Readonly<{
  [chainId: number]: Readonly<{ [tokenAddress: string]: { token: WrappedTokenInfo; list: TokenList } }>
}>

type Mutable<T> = {
  -readonly [P in keyof T]: Mutable<T[P]>
} 
*/

/**
 * An empty result, useful as a default.
 */
export const EMPTY_LIST: TokenAddressMap = {
  [ChainId.RINKEBY]: {},
  [ChainId.MAINNET]: {},
  [ChainId.XDAI]: {},
}

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list)
  if (result) return result

  /*
    const map = list.tokens.reduce<Mutable<TokenAddressMap>>((tokenMap, tokenInfo) => {
    const token = new WrappedTokenInfo(tokenInfo, list)
    if (tokenMap[token.chainId]?.[token.address] !== undefined) {
      console.error(`Duplicate token! ${token.address}`)
      return tokenMap
    }
    if (!tokenMap[token.chainId]) tokenMap[token.chainId] = {}
    tokenMap[token.chainId][token.address] = {
      token,
      list,
    }
    return tokenMap
  }, {}) as TokenAddressMap
    listCache?.set(list, map)
    return map
  } 
*/

  const map = list.tokens.reduce<TokenAddressMap>((tokenMap, tokenInfo) => {
    const token = new WrappedTokenInfo(tokenInfo, list)
    const tokensByNetwork = tokenMap[token.chainId] || {}
    if (tokensByNetwork[token.address] !== undefined) {
      console.error(new Error(`Duplicate token! ${token.address}`))
      return tokenMap
    }
    return {
      ...tokenMap,
      [token.chainId]: {
        ...tokensByNetwork,
        [token.address]: {
          token,
          list,
        },
      },
    }
  }, {})
  listCache?.set(list, map)
  return map
}

// export function useAllLists(): AppState['lists']['byUrl'] {
export function useAllLists(): AppState['lists'][ChainId]['byUrl'] {
  // MOD: adds { chainId } support to the hooks
  const { chainId: connectedChainId } = useActiveWeb3React()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS
  // return useAppSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  return useAppSelector((state) => state.lists[chainId].byUrl)
}

/**
 * Combine the tokens in map2 with the tokens on map1, where tokens on map1 take precedence
 * @param map1 the base token map
 * @param map2 the map of additioanl tokens to add to the base map
 */
/*
export function combineMaps(map1: TokenAddressMap, map2: TokenAddressMap): TokenAddressMap {
  const chainIds = Object.keys(
    Object.keys(map1)
      .concat(Object.keys(map2))
      .reduce<{ [chainId: string]: true }>((memo, value) => {
        memo[value] = true
        return memo
      }, {})
  ).map((id) => parseInt(id))

  return chainIds.reduce<Mutable<TokenAddressMap>>((memo, chainId) => {
    memo[chainId] = {
      ...map2[chainId],
      // map1 takes precedence
      ...map1[chainId],
    }
    return memo
  }, {}) as TokenAddressMap
} 
*/

// merge tokens contained within lists from urls
export function useCombinedTokenMapFromUrls(urls: string[] | undefined): TokenAddressMap {
  // MOD: recreated here to allow it to use the custom useAllLists hook
  const lists = useAllLists()
  return useMemo(() => {
    if (!urls) return EMPTY_LIST

    return (
      urls
        .slice()
        // sort by priority so top priority goes last
        .sort(sortByListPriority)
        .reduce((allTokens, currentUrl) => {
          const current = lists[currentUrl]?.current
          if (!current) return allTokens
          try {
            const newTokens = Object.assign(listToTokenMap(current))
            return combineMaps(allTokens, newTokens)
          } catch (error) {
            console.error('Could not show token list due to error', error)
            return allTokens
          }
        }, EMPTY_LIST)
    )
  }, [lists, urls])
}

// filter out unsupported lists
export function useActiveListUrls(): string[] | undefined {
  // MOD: adds { chainId } support to the hooks
  const { chainId: connectedChainId } = useActiveWeb3React()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS
  return useAppSelector((state) => state.lists[chainId].activeListUrls)?.filter(
    (url) => !UNSUPPORTED_LIST_URLS[chainId].includes(url)
  )
}

export function useInactiveListUrls(): string[] {
  // MOD: adds { chainId } support to the hooks
  const { chainId: connectedChainId } = useActiveWeb3React()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS
  const lists = useAllLists()
  const allActiveListUrls = useActiveListUrls()
  return Object.keys(lists).filter(
    (url) => !allActiveListUrls?.includes(url) && !UNSUPPORTED_LIST_URLS[chainId].includes(url)
  )
}

// get all the tokens from active lists, combine with local default tokens
export function useCombinedActiveList(): TokenAddressMap {
  // MOD: added here to use the scoped functions
  const activeListUrls = useActiveListUrls()
  const activeTokens = useCombinedTokenMapFromUrls(activeListUrls)
  const defaultTokenMap = listToTokenMap(DEFAULT_TOKEN_LIST)
  return combineMaps(activeTokens, defaultTokenMap)
}

// all tokens from inactive lists
export function useCombinedInactiveList(): TokenAddressMap {
  // MOD: added here to use the scoped functions
  const allInactiveListUrls: string[] = useInactiveListUrls()
  return useCombinedTokenMapFromUrls(allInactiveListUrls)
}

// used to hide warnings on import for default tokens
export function useDefaultTokenList(): TokenAddressMap {
  // MOD: added here to use the scoped functions
  return listToTokenMap(DEFAULT_TOKEN_LIST)
}

// list of tokens not supported on interface for various reasons, used to show warnings and prevent swaps and adds
export function useUnsupportedTokenList(): TokenAddressMap {
  // MOD: adds { chainId } support to the hooks
  const { chainId: connectedChainId } = useActiveWeb3React()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS
  // get hard-coded broken tokens
  const brokenListMap = useMemo(() => listToTokenMap(BROKEN_LIST), [])

  // get hard-coded list of unsupported tokens
  const localUnsupportedListMap = useMemo(() => listToTokenMap(UNSUPPORTED_TOKEN_LIST), [])

  // get dynamic list of unsupported tokens
  const loadedUnsupportedListMap = useCombinedTokenMapFromUrls(UNSUPPORTED_LIST_URLS[chainId])

  // format into one token address map
  return useMemo(
    () => combineMaps(brokenListMap, combineMaps(localUnsupportedListMap, loadedUnsupportedListMap)),
    [brokenListMap, localUnsupportedListMap, loadedUnsupportedListMap]
  )
}
export function useIsListActive(url: string): boolean {
  // MOD: added here to use the scoped functions
  const activeListUrls = useActiveListUrls()
  return Boolean(activeListUrls?.includes(url))
}

export function useGpUnsupportedTokens(): UnsupportedToken | null {
  const { chainId: connectedChainId } = useActiveWeb3React()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS
  return useAppSelector((state) => (chainId ? state.lists[chainId].gpUnsupportedTokens : null))
}

export function useAddGpUnsupportedToken() {
  const dispatch = useAppDispatch()

  return useCallback((params: AddGpUnsupportedTokenParams) => dispatch(addGpUnsupportedToken(params)), [dispatch])
}

export function useRemoveGpUnsupportedToken() {
  const dispatch = useAppDispatch()

  return useCallback((params: RemoveGpUnsupportedTokenParams) => dispatch(removeGpUnsupportedToken(params)), [dispatch])
}

export function useIsUnsupportedTokenFromLists() {
  const { chainId } = useActiveWeb3React()
  const allUnsupportedTokens = useUnsupportedTokenList()

  return useCallback(
    (addressToCheck?: string) => {
      const checkSummedAddress = isAddress(addressToCheck)

      if (!checkSummedAddress || !chainId || !allUnsupportedTokens[chainId][checkSummedAddress]) return false

      const { address } = allUnsupportedTokens[chainId][checkSummedAddress].token

      return Boolean(address)
    },
    [allUnsupportedTokens, chainId]
  )
}

export function useIsUnsupportedTokenGp() {
  const { chainId } = useActiveWeb3React()
  const gpUnsupportedTokens = useGpUnsupportedTokens()

  return useCallback(
    (address?: string) => {
      if (!address || !chainId || !gpUnsupportedTokens) return false

      return gpUnsupportedTokens[address.toLowerCase()]
    },
    [chainId, gpUnsupportedTokens]
  )
}

export function useIsUnsupportedToken() {
  const isUnsupportedTokenFromList = useIsUnsupportedTokenFromLists()
  const isUnsupportedTokenGp = useIsUnsupportedTokenGp()

  return useCallback(
    (address?: string) => {
      // Returns a predicate function determining a token's support by address against our hooks
      return Boolean(isUnsupportedTokenFromList(address) || isUnsupportedTokenGp(address))
    },
    [isUnsupportedTokenFromList, isUnsupportedTokenGp]
  )
}
