import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../..'
import { ChainId } from '@uniswap/sdk'
import { useActiveWeb3React } from 'hooks'
import { DEFAULT_NETWORK_FOR_LISTS, UNSUPPORTED_LIST_URLS } from 'constants/lists'
import { TokenList } from '@uniswap/token-lists'
import DEFAULT_TOKEN_LIST from '@uniswap/default-token-list'
import { TokenAddressMap, listToTokenMap, combineMaps, EMPTY_LIST } from '@src/state/lists/hooks'
import sortByListPriority from 'utils/listSort'
import UNSUPPORTED_TOKEN_LIST from 'constants/tokenLists/uniswap-v2-unsupported.tokenlist.json'
import {
  addGpUnsupportedToken,
  AddGpUnsupportedTokenParams,
  RemoveGpUnsupportedTokenParams,
  removeGpUnsupportedToken
} from '../actions'
import { UnsupportedToken } from 'utils/operator'
import { isAddress } from 'utils'

// type TagDetails = Tags[keyof Tags]
// export interface TagInfo extends TagDetails {
//   id: string
// }

// /**
//  * Token instances created from token info.
//  */
// export class WrappedTokenInfo extends Token {
//   public readonly tokenInfo: TokenInfo
//   public readonly tags: TagInfo[]
//   constructor(tokenInfo: TokenInfo, tags: TagInfo[]) {
//     super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name)
//     this.tokenInfo = tokenInfo
//     this.tags = tags
//   }
//   public get logoURI(): string | undefined {
//     return this.tokenInfo.logoURI
//   }
// }

// export type TokenAddressMap = Readonly<
//   { [chainId in ChainId]: Readonly<{ [tokenAddress: string]: { token: WrappedTokenInfo; list: TokenList } }> }
// >

// /**
//  * An empty result, useful as a default.
//  */
// export const EMPTY_LIST: TokenAddressMap = {
//   [ChainId.KOVAN]: {},
//   [ChainId.RINKEBY]: {},
//   [ChainId.ROPSTEN]: {},
//   [ChainId.GÖRLI]: {},
//   [ChainId.MAINNET]: {},
//   [ChainId.XDAI]: {}
// }

// const listCache: WeakMap<TokenList, TokenAddressMap> | null =
//   typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null

// export function listToTokenMap(list: TokenList): TokenAddressMap {
//   const result = listCache?.get(list)
//   if (result) return result

//   const map = list.tokens.reduce<TokenAddressMap>(
//     (tokenMap, tokenInfo) => {
//       const tags: TagInfo[] =
//         tokenInfo.tags
//           ?.map(tagId => {
//             if (!list.tags?.[tagId]) return undefined
//             return { ...list.tags[tagId], id: tagId }
//           })
//           ?.filter((x): x is TagInfo => Boolean(x)) ?? []
//       const token = new WrappedTokenInfo(tokenInfo, tags)
//       if (tokenMap[token.chainId][token.address] !== undefined) throw Error('Duplicate tokens.')
//       return {
//         ...tokenMap,
//         [token.chainId]: {
//           ...tokenMap[token.chainId],
//           [token.address]: {
//             token,
//             list: list
//           }
//         }
//       }
//     },
//     { ...EMPTY_LIST }
//   )
//   listCache?.set(list, map)
//   return map
// }

export function useAllLists(): {
  readonly [url: string]: {
    readonly current: TokenList | null
    readonly pendingUpdate: TokenList | null
    readonly loadingRequestId: string | null
    readonly error: string | null
  }
} {
  // MOD: adds { chainId } support to the hooks
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useActiveWeb3React()
  // return useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  return useSelector<AppState, AppState['lists'][ChainId]['byUrl']>(state => state.lists[chainId].byUrl)
}

// export function combineMaps(map1: TokenAddressMap, map2: TokenAddressMap): TokenAddressMap {
//   return {
//     1: { ...map1[1], ...map2[1] },
//     3: { ...map1[3], ...map2[3] },
//     4: { ...map1[4], ...map2[4] },
//     5: { ...map1[5], ...map2[5] },
//     42: { ...map1[42], ...map2[42] },
//     100: { ...map1[100], ...map2[100] }
//   }

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
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useActiveWeb3React()
  return useSelector<AppState, AppState['lists'][ChainId]['activeListUrls']>(
    state => state.lists[chainId].activeListUrls
  )?.filter(url => !UNSUPPORTED_LIST_URLS[chainId].includes(url))
}

export function useInactiveListUrls(): string[] {
  // MOD: adds { chainId } support to the hooks
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useActiveWeb3React()
  const lists = useAllLists()
  const allActiveListUrls = useActiveListUrls()
  return Object.keys(lists).filter(
    url => !allActiveListUrls?.includes(url) && !UNSUPPORTED_LIST_URLS[chainId].includes(url)
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

// list of tokens not supported on interface, used to show warnings and prevent swaps and adds
export function useUnsupportedTokenList(): TokenAddressMap {
  // MOD: adds { chainId } support to the hooks
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useActiveWeb3React()
  // get hard coded unsupported tokens
  const localUnsupportedListMap = listToTokenMap(UNSUPPORTED_TOKEN_LIST)

  // get any loaded unsupported tokens
  const loadedUnsupportedListMap = useCombinedTokenMapFromUrls(UNSUPPORTED_LIST_URLS[chainId])

  // format into one token address map
  return combineMaps(localUnsupportedListMap, loadedUnsupportedListMap)
}

export function useIsListActive(url: string): boolean {
  // MOD: added here to use the scoped functions
  const activeListUrls = useActiveListUrls()
  return Boolean(activeListUrls?.includes(url))
}

export function useGpUnsupportedTokens(): UnsupportedToken | null {
  const { chainId } = useActiveWeb3React()
  return useSelector<AppState, AppState['lists'][ChainId]['gpUnsupportedTokens'] | null>(state =>
    chainId ? state.lists[chainId].gpUnsupportedTokens : null
  )
}

export function useAddGpUnsupportedToken() {
  const dispatch = useDispatch()

  return useCallback((params: AddGpUnsupportedTokenParams) => dispatch(addGpUnsupportedToken(params)), [dispatch])
}

export function useRemoveGpUnsupportedToken() {
  const dispatch = useDispatch()

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
      // Returns a predicate function determining a token's support by address against our Set
      return Boolean(isUnsupportedTokenFromList(address) || isUnsupportedTokenGp(address))
    },
    [isUnsupportedTokenFromList, isUnsupportedTokenGp]
  )
}
