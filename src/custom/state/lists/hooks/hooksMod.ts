import { useMemo, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from 'state/hooks'
import sortByListPriority from 'utils/listSort'
import { AppState } from 'state'
import { UNSUPPORTED_LIST_URLS, DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import DEFAULT_TOKEN_LIST from '@uniswap/default-token-list'
import { useWeb3React } from '@web3-react/core'
import {
  addGpUnsupportedToken,
  AddGpUnsupportedTokenParams,
  RemoveGpUnsupportedTokenParams,
  removeGpUnsupportedToken,
} from '../actions'
import { UnsupportedToken } from '@cow/api/gnosisProtocol'
import { SupportedChainId as ChainId } from 'constants/chains'
import { supportedChainId } from 'utils/supportedChainId'
import { shallowEqual } from 'react-redux'
import { TokenInfo } from '@uniswap/token-lists'
import { Currency } from '@uniswap/sdk-core'

export function useAllLists(): AppState['lists'][ChainId]['byUrl'] {
  const { chainId: connectedChainId } = useWeb3React()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS

  return useAppSelector((state) => state.lists[chainId]?.byUrl, shallowEqual)
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
  const { chainId } = useWeb3React()
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

export function useActiveListUrls(): string[] | undefined {
  const { chainId: connectedChainId } = useWeb3React()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS
  const activeListUrls = useAppSelector((state) => state.lists[chainId]?.activeListUrls, shallowEqual)

  return useMemo(() => {
    return activeListUrls?.filter((url) => !UNSUPPORTED_LIST_URLS[chainId]?.includes(url))
  }, [chainId, activeListUrls])
}

export function useIsListActive(url: string): boolean {
  const activeListUrls = useActiveListUrls()
  return Boolean(activeListUrls?.includes(url))
}

export function useGpUnsupportedTokens(): UnsupportedToken | null {
  const { chainId: connectedChainId } = useWeb3React()
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
  const { chainId } = useWeb3React()
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
  const { chainId: connectedChainId } = useWeb3React()
  const chainId = supportedChainId(connectedChainId) ?? DEFAULT_NETWORK_FOR_LISTS
  const lists = useAllLists()
  const allActiveListUrls = useActiveListUrls()
  return Object.keys(lists).filter(
    (url) => !allActiveListUrls?.includes(url) && !UNSUPPORTED_LIST_URLS[chainId].includes(url)
  )
}
