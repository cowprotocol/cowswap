import { useCallback, useMemo } from 'react'

import { UNSUPPORTED_LIST_URLS } from '@cowprotocol/common-const'
import { sortByListPriority } from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import DEFAULT_TOKEN_LIST from '@uniswap/default-token-list'
import { Currency } from '@uniswap/sdk-core'
import { TokenInfo } from '@uniswap/token-lists'

import { shallowEqual } from 'react-redux'
import { Nullish } from 'types'

import { UnsupportedToken } from 'api/gnosisProtocol'
import { ChainTokenMap, tokensToChainTokenMap } from 'lib/hooks/useTokenList/utils'

import {
  addGpUnsupportedToken,
  AddGpUnsupportedTokenParams,
  removeGpUnsupportedToken,
  RemoveGpUnsupportedTokenParams,
} from './actions'

import { useAppDispatch, useAppSelector } from '../hooks'
import { AppState } from '../index'

export type TokenAddressMap = ChainTokenMap

type Mutable<T> = {
  -readonly [P in keyof T]: Mutable<T[P]>
}

export function useActiveListUrls(): string[] | undefined {
  const { chainId } = useWalletInfo()

  return useAppSelector((state) => state.lists[chainId]?.activeListUrls, shallowEqual)
}

export function useAllLists(): AppState['lists'][ChainId]['byUrl'] {
  const { chainId } = useWalletInfo()

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
  return useCombinedTokenMapFromUrls(UNSUPPORTED_LIST_URLS[1])
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
  const { chainId } = useWalletInfo()

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

export function useIsUnsupportedTokens() {
  const gpUnsupportedTokens = useGpUnsupportedTokens()

  return useCallback(
    ({ sellToken, buyToken }: { sellToken: Nullish<string>; buyToken: Nullish<string> }) => {
      if (!gpUnsupportedTokens) return false

      return !!(
        (sellToken && gpUnsupportedTokens[sellToken.toLowerCase()]) ||
        (buyToken && gpUnsupportedTokens[buyToken.toLowerCase()])
      )
    },
    [gpUnsupportedTokens]
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
  const { chainId } = useWalletInfo()
  const lists = useAllLists()
  const allActiveListUrls = useActiveListUrls()
  return Object.keys(lists).filter(
    (url) => !allActiveListUrls?.includes(url) && !UNSUPPORTED_LIST_URLS[chainId].includes(url)
  )
}
