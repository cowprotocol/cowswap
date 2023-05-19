import { ChainTokenMap, tokensToChainTokenMap } from 'lib/hooks/useTokenList/utils'
import { useCallback, useMemo } from 'react'
import sortByListPriority from 'utils/listSort'
import BROKEN_LIST from 'legacy/constants/tokenLists/broken.tokenlist.json'
import UNSUPPORTED_TOKEN_LIST from 'legacy/constants/tokenLists/unsupported.tokenlist.json'
import { DEFAULT_NETWORK_FOR_LISTS, UNSUPPORTED_LIST_URLS } from 'constants/lists'
import { AppState } from 'state'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from 'modules/wallet'
import { supportedChainId } from 'utils/supportedChainId'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { shallowEqual } from 'react-redux'
import { TokenInfo } from '@uniswap/token-lists'
import { UnsupportedToken } from 'api/gnosisProtocol'
import {
  addGpUnsupportedToken,
  AddGpUnsupportedTokenParams,
  removeGpUnsupportedToken,
  RemoveGpUnsupportedTokenParams,
} from 'state/lists/actions'
import { Currency } from '@uniswap/sdk-core'
import DEFAULT_TOKEN_LIST from '@uniswap/default-token-list'

export type TokenAddressMap = ChainTokenMap

type Mutable<T> = {
  -readonly [P in keyof T]: Mutable<T[P]>
}

export function useActiveListUrls(): string[] | undefined {
  const { chainId: connectedChainId } = useWalletInfo()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS
  const activeListUrls = useAppSelector((state) => state.lists[chainId]?.activeListUrls, shallowEqual)

  return useMemo(() => {
    return activeListUrls?.filter((url) => !UNSUPPORTED_LIST_URLS[chainId]?.includes(url))
  }, [chainId, activeListUrls])
}

export function useAllLists(): AppState['lists'][ChainId]['byUrl'] {
  const { chainId: connectedChainId } = useWalletInfo()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS

  return useAppSelector((state) => state.lists[chainId]?.byUrl, shallowEqual)
}

/**
 * Combine the tokens in map2 with the tokens on map1, where tokens on map1 take precedence
 * @param map1 the base token map
 * @param map2 the map of additioanl tokens to add to the base map
 */
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

// merge tokens contained within lists from urls
export function useCombinedTokenMapFromUrls(urls: string[] | undefined): TokenAddressMap {
  const lists = useAllLists()
  return useMemo(() => {
    if (!urls) return {}
    return (
      urls
        .slice()
        // sort by priority so top priority goes last
        .sort(sortByListPriority)
        .reduce((allTokens, currentUrl) => {
          const current = lists[currentUrl]?.current
          if (!current) return allTokens
          try {
            return combineMaps(allTokens, tokensToChainTokenMap(current))
          } catch (error: any) {
            console.error('Could not show token list due to error', error)
            return allTokens
          }
        }, {})
    )
  }, [lists, urls])
}

// get all the tokens from active lists, combine with local default tokens
export function useCombinedActiveList(): TokenAddressMap {
  const activeListUrls = useActiveListUrls()
  const activeTokens = useCombinedTokenMapFromUrls(activeListUrls)
  return activeTokens
}

// list of tokens not supported on interface for various reasons, used to show warnings and prevent swaps and adds
export function useUnsupportedTokenList(): TokenAddressMap {
  // get hard-coded broken tokens
  const brokenListMap = useMemo(() => tokensToChainTokenMap(BROKEN_LIST), [])

  // get hard-coded list of unsupported tokens
  const localUnsupportedListMap = useMemo(() => tokensToChainTokenMap(UNSUPPORTED_TOKEN_LIST), [])

  // get dynamic list of unsupported tokens
  const loadedUnsupportedListMap = useCombinedTokenMapFromUrls(UNSUPPORTED_LIST_URLS[1])

  // format into one token address map
  return useMemo(
    () => combineMaps(brokenListMap, combineMaps(localUnsupportedListMap, loadedUnsupportedListMap)),
    [brokenListMap, localUnsupportedListMap, loadedUnsupportedListMap]
  )
}

export function useTokensListFromUrls(urls: string[] | undefined): TokenInfo[] {
  const lists = useAllLists()

  return useMemo(() => {
    if (!urls) return []

    return (
      urls
        .slice()
        // sort by priority so top priority goes last
        .sort(sortByListPriority)
        .map((url) => {
          return lists?.[url]?.current?.tokens || []
        })
        .flat()
    )
  }, [lists, urls])
}

export function useTokensListWithDefaults(): TokenInfo[] {
  const { chainId } = useWalletInfo()
  const activeListUrls = useActiveListUrls()
  const allTokens = useTokensListFromUrls(activeListUrls)
  const allUserAddedTokens = useAppSelector(({ user: { tokens } }) => tokens)

  return useMemo(() => {
    if (!chainId) return []

    const userAddedTokens = Object.values(allUserAddedTokens[chainId] || {}) as TokenInfo[]
    const defaultTokens = DEFAULT_TOKEN_LIST.tokens
    return allTokens
      .concat(defaultTokens)
      .concat(userAddedTokens)
      .filter((token) => token.chainId === chainId)
  }, [allTokens, chainId, allUserAddedTokens])
}

export function useIsListActive(url: string): boolean {
  const activeListUrls = useActiveListUrls()
  return Boolean(activeListUrls?.includes(url))
}

export function useGpUnsupportedTokens(): UnsupportedToken | null {
  const { chainId: connectedChainId } = useWalletInfo()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS
  return useAppSelector((state) => (chainId ? state.lists[chainId]?.gpUnsupportedTokens : null))
}

export function useAddGpUnsupportedToken() {
  const dispatch = useAppDispatch()

  return useCallback((params: AddGpUnsupportedTokenParams) => dispatch(addGpUnsupportedToken(params)), [dispatch])
}

export function useRemoveGpUnsupportedToken() {
  const dispatch = useAppDispatch()

  return useCallback((params: RemoveGpUnsupportedTokenParams) => dispatch(removeGpUnsupportedToken(params)), [dispatch])
}

export function useIsUnsupportedTokenGp() {
  const { chainId } = useWalletInfo()
  const gpUnsupportedTokens = useGpUnsupportedTokens()

  return useCallback(
    (address?: string) => {
      if (!address || !chainId || !gpUnsupportedTokens) return false

      return gpUnsupportedTokens[address.toLowerCase()]
    },
    [chainId, gpUnsupportedTokens]
  )
}

export function useIsTradeUnsupported(
  inputCurrency: Currency | null | undefined,
  outputCurrency: Currency | null | undefined
): boolean {
  const isUnsupportedToken = useIsUnsupportedTokenGp()
  const isInputCurrencyUnsupported = inputCurrency?.isNative ? false : !!isUnsupportedToken(inputCurrency?.address)
  const isOutputCurrencyUnsupported = outputCurrency?.isNative ? false : !!isUnsupportedToken(outputCurrency?.address)

  return isInputCurrencyUnsupported || isOutputCurrencyUnsupported
}

export function useInactiveListUrls(): string[] {
  // MOD: adds { chainId } support to the hooks
  const { chainId: connectedChainId } = useWalletInfo()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS
  const lists = useAllLists()
  const allActiveListUrls = useActiveListUrls()
  return Object.keys(lists).filter(
    (url) => !allActiveListUrls?.includes(url) && !UNSUPPORTED_LIST_URLS[chainId].includes(url)
  )
}
