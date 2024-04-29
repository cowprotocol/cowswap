import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { isAddress } from '@cowprotocol/common-utils'
import { useWeb3React } from '@web3-react/core'

import ms from 'ms.macro'
import useSWR from 'swr'

import { searchTokensInApi } from '../../services/searchTokensInApi'
import { environmentAtom } from '../../state/environmentAtom'
import { activeTokensAtom, inactiveTokensAtom } from '../../state/tokens/allTokensAtom'
import { fetchTokenFromBlockchain } from '../../utils/fetchTokenFromBlockchain'
import { getTokenSearchFilter } from '../../utils/getTokenSearchFilter'
import { parseTokensFromApi } from '../../utils/parseTokensFromApi'

const IN_LISTS_DEBOUNCE_TIME = ms`100ms`
const IN_EXTERNALS_DEBOUNCE_TIME = ms`1s`

export type TokenSearchResponse = {
  isLoading: boolean
  blockchainResult: TokenWithLogo[]
  externalApiResult: TokenWithLogo[]
  activeListsResult: TokenWithLogo[]
  inactiveListsResult: TokenWithLogo[]
}

type FromListsResult = {
  tokensFromActiveLists: TokenWithLogo[]
  tokensFromInactiveLists: TokenWithLogo[]
}

const emptyResponse: TokenSearchResponse = {
  isLoading: false,
  blockchainResult: [],
  externalApiResult: [],
  activeListsResult: [],
  inactiveListsResult: [],
}

const emptyFromListsResult: FromListsResult = { tokensFromActiveLists: [], tokensFromInactiveLists: [] }

/**
 * The hook is searching into 4 sources: active lists, inactive lists, external API, and blockchain
 * useSWR is widely used inside to cache the search results
 */
export function useSearchToken(input: string | null): TokenSearchResponse {
  const inputLowerCase = input?.toLowerCase()
  const [isLoading, setIsLoading] = useState(false)
  const debouncedInputInList = useDebounce(inputLowerCase, IN_LISTS_DEBOUNCE_TIME)
  const debouncedInputInExternals = useDebounce(inputLowerCase, IN_EXTERNALS_DEBOUNCE_TIME)

  const isInputStale = debouncedInputInExternals !== inputLowerCase

  // Search in active and inactive lists
  const { tokensFromActiveLists, tokensFromInactiveLists } = useSearchTokensInLists(debouncedInputInList)

  const isTokenAlreadyFoundByAddress = useMemo(() => {
    return tokensFromActiveLists.some((token) => token.address.toLowerCase() === debouncedInputInList)
  }, [debouncedInputInList, tokensFromActiveLists])

  // Search in external API
  const { data: apiResultTokens, isLoading: apiIsLoading } = useSearchTokensInApi(
    debouncedInputInExternals,
    isTokenAlreadyFoundByAddress
  )

  // Search in Blockchain
  const { data: tokenFromBlockChain, isLoading: blockchainIsLoading } = useFetchTokenFromBlockchain(
    debouncedInputInExternals,
    isTokenAlreadyFoundByAddress
  )

  useEffect(() => {
    setIsLoading(true)
  }, [inputLowerCase])

  useEffect(() => {
    // When there are results from toke lists, then we don't need to wait for the rest
    if (tokensFromActiveLists.length || tokensFromInactiveLists.length) {
      setIsLoading(false)
      return
    }

    // Change loading state only when input is not stale
    if (isInputStale) return

    // Loading is finished when all sources are loaded
    if (!apiIsLoading && !blockchainIsLoading) {
      setIsLoading(false)
    }
  }, [isInputStale, apiIsLoading, blockchainIsLoading, tokensFromActiveLists, tokensFromInactiveLists])

  return useMemo(() => {
    if (!debouncedInputInList) {
      return emptyResponse
    }

    if (isTokenAlreadyFoundByAddress) {
      return {
        ...emptyResponse,
        isLoading,
        activeListsResult: tokensFromActiveLists,
      }
    }

    const foundTokens = tokensFromActiveLists.reduce<{ [address: string]: true }>((acc, val) => {
      acc[val.address.toLowerCase()] = true
      return acc
    }, {})

    const filterFoundTokens = (token: TokenWithLogo) => !foundTokens[token.address.toLowerCase()]

    const inactiveListsResult = tokensFromInactiveLists.filter(filterFoundTokens)
    const blockchainResult = !isInputStale && tokenFromBlockChain ? [tokenFromBlockChain] : []
    const externalApiResult = !isInputStale && apiResultTokens ? apiResultTokens.filter(filterFoundTokens) : []

    return {
      isLoading,
      activeListsResult: tokensFromActiveLists,
      inactiveListsResult,
      blockchainResult,
      externalApiResult,
    }
  }, [
    isInputStale,
    isLoading,
    debouncedInputInList,
    isTokenAlreadyFoundByAddress,
    tokensFromActiveLists,
    tokensFromInactiveLists,
    apiResultTokens,
    tokenFromBlockChain,
  ])
}

function useSearchTokensInLists(input: string | undefined): FromListsResult {
  const activeTokens = useAtomValue(activeTokensAtom)
  const inactiveTokens = useAtomValue(inactiveTokensAtom)

  const { data: inListsResult } = useSWR<FromListsResult>(
    ['searchTokensInLists', input, activeTokens, inactiveTokens],
    () => {
      if (!input) return emptyFromListsResult

      const filter = getTokenSearchFilter(input)
      const tokensFromActiveLists = activeTokens.filter(filter)
      const tokensFromInactiveLists = inactiveTokens.filter(filter)

      return { tokensFromActiveLists, tokensFromInactiveLists }
    }
  )

  return inListsResult || emptyFromListsResult
}

function useSearchTokensInApi(input: string | undefined, isTokenAlreadyFoundByAddress: boolean) {
  const { chainId } = useAtomValue(environmentAtom)

  return useSWR<TokenWithLogo[] | null>(['searchTokensInApi', input], () => {
    if (isTokenAlreadyFoundByAddress || !input) {
      return null
    }

    return searchTokensInApi(input).then((result) => parseTokensFromApi(result, chainId))
  })
}

function useFetchTokenFromBlockchain(input: string | undefined, isTokenAlreadyFoundByAddress: boolean) {
  const { chainId } = useAtomValue(environmentAtom)
  const { provider } = useWeb3React()

  return useSWR<TokenWithLogo | null>(['fetchTokenFromBlockchain', input], () => {
    if (isTokenAlreadyFoundByAddress || !input || !provider || !isAddress(input)) {
      return null
    }

    return fetchTokenFromBlockchain(input, chainId, provider).then(TokenWithLogo.fromToken)
  })
}
