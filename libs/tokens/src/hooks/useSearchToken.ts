import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { activeTokensAtom, inactiveTokensAtom } from '../state/tokens/tokensAtom'
import { useDebounce } from '@cowprotocol/common-hooks'
import { useWeb3React } from '@web3-react/core'
import { TokenInfo } from '@uniswap/token-lists'
import { isAddress } from '@cowprotocol/common-utils'
import ms from 'ms.macro'
import { getTokenSearchFilter } from '../utils/getTokenSearchFilter'
import useSWR from 'swr'
import { searchTokensInApi, TokenSearchFromApiResult } from '../services/searchTokensInApi'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { environmentAtom } from '../state/environmentAtom'
import { parseTokensFromApi } from '../utils/parseTokensFromApi'
import { fetchTokenFromBlockchain } from '../utils/fetchTokenFromBlockchain'

const IN_LISTS_DEBOUNCE_TIME = ms`100ms`
const IN_EXTERNALS_DEBOUNCE_TIME = ms`1000ms`

export type TokenSearchResponse = {
  isLoading: boolean
  blockchainResult: TokenWithLogo[] | null
  externalApiResult: TokenWithLogo[] | null
  activeListsResult: TokenWithLogo[] | null
  inactiveListsResult: TokenWithLogo[] | null
}

const emptyResponse: TokenSearchResponse = {
  isLoading: false,
  blockchainResult: null,
  externalApiResult: null,
  activeListsResult: null,
  inactiveListsResult: null,
}

// TODO: implement search with debouncing and caching
export function useSearchToken(input: string | null): TokenSearchResponse {
  const { provider } = useWeb3React()

  const debouncedInputInList = useDebounce(input?.toLowerCase(), IN_LISTS_DEBOUNCE_TIME)
  const debouncedInputInExternals = useDebounce(input?.toLowerCase(), IN_EXTERNALS_DEBOUNCE_TIME)

  const { chainId } = useAtomValue(environmentAtom)
  const activeTokens = useAtomValue(activeTokensAtom)
  const inactiveTokens = useAtomValue(inactiveTokensAtom)

  const { data: inListsResult } = useSWR<{
    tokensFromActiveLists: TokenWithLogo[]
    tokensFromInactiveLists: TokenWithLogo[]
  } | null>(['searchTokensInLists', debouncedInputInList], () => {
    if (!debouncedInputInList) return null

    const tokensFromActiveLists = activeTokens.filter(getTokenSearchFilter(debouncedInputInList))
    const tokensFromInactiveLists = inactiveTokens.filter(getTokenSearchFilter(debouncedInputInList))

    return { tokensFromActiveLists, tokensFromInactiveLists }
  })

  const { data: apiResult, isLoading: apiIsLoading } = useSWR<TokenSearchFromApiResult[] | null>(
    ['searchTokensInApi', debouncedInputInExternals],
    () => {
      if (!debouncedInputInExternals) return null

      return searchTokensInApi(debouncedInputInExternals)
    }
  )

  const { data: blockchainResult, isLoading: blockchainIsLoading } = useSWR<TokenInfo | null>(
    ['fetchTokenFromBlockchain', debouncedInputInExternals],
    () => {
      if (!debouncedInputInExternals || !provider || !isAddress(debouncedInputInExternals)) return null

      return fetchTokenFromBlockchain(debouncedInputInExternals, chainId, provider)
    }
  )

  const apiResultTokens = useMemo(() => {
    if (!apiResult?.length) return null

    return parseTokensFromApi(apiResult, chainId)
  }, [apiResult, chainId])

  const tokenFromBlockChain = useMemo(() => {
    if (!blockchainResult) return null

    return new TokenWithLogo(
      undefined,
      blockchainResult.chainId,
      blockchainResult.address,
      blockchainResult.decimals,
      blockchainResult.symbol,
      blockchainResult.name
    )
  }, [blockchainResult])

  return useMemo(() => {
    if (!input) {
      return emptyResponse
    }

    const isTokenAlreadyFound = inListsResult?.tokensFromActiveLists.find(
      (token) => token.address.toLowerCase() === input.toLowerCase()
    )

    if (isTokenAlreadyFound) {
      return {
        isLoading: apiIsLoading || blockchainIsLoading,
        activeListsResult: inListsResult?.tokensFromActiveLists || null,
        blockchainResult: null,
        inactiveListsResult: null,
        externalApiResult: null,
      }
    }

    return {
      isLoading: apiIsLoading || blockchainIsLoading,
      blockchainResult: tokenFromBlockChain ? [tokenFromBlockChain] : null,
      activeListsResult: inListsResult?.tokensFromActiveLists || null,
      inactiveListsResult: inListsResult?.tokensFromInactiveLists || null,
      externalApiResult: apiResultTokens,
    }
  }, [input, inListsResult, apiResultTokens, tokenFromBlockChain, apiIsLoading, blockchainIsLoading])
}
