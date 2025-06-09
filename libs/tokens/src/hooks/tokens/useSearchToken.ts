import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { isAddress } from '@cowprotocol/common-utils'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import ms from 'ms.macro'
import useSWR from 'swr'

import { searchTokensInApi } from '../../services/searchTokensInApi'
import { environmentAtom } from '../../state/environmentAtom'
import { allActiveTokensAtom, inactiveTokensAtom } from '../../state/tokens/allTokensAtom'
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
// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function useSearchToken(input: string | null): TokenSearchResponse {
  const inputLowerCase = input?.toLowerCase()
  const [isLoading, setIsLoading] = useState(false)
  const debouncedInputInList = useDebounce(inputLowerCase, IN_LISTS_DEBOUNCE_TIME)
  const debouncedInputInExternals = useDebounce(inputLowerCase, IN_EXTERNALS_DEBOUNCE_TIME)

  const isInputStale = debouncedInputInExternals !== inputLowerCase

  // Search in active and inactive lists
  const { tokensFromActiveLists, tokensFromInactiveLists } = useSearchTokensInLists(debouncedInputInList)

  const isTokenAlreadyFoundByAddress = useMemo(() => {
    return [...tokensFromActiveLists, ...tokensFromInactiveLists].some(
      (token) => token.address.toLowerCase() === debouncedInputInList,
    )
  }, [debouncedInputInList, tokensFromActiveLists, tokensFromInactiveLists])

  // Search in external API
  const { data: apiResultTokens, isLoading: apiIsLoading } = useSearchTokensInApi(
    debouncedInputInExternals,
    isTokenAlreadyFoundByAddress,
  )

  // Search in Blockchain
  const { data: tokenFromBlockChain, isLoading: blockchainIsLoading } = useFetchTokenFromBlockchain(
    debouncedInputInExternals,
    isTokenAlreadyFoundByAddress,
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
        inactiveListsResult: tokensFromInactiveLists,
      }
    }

    const blockchainResult = !isInputStale && tokenFromBlockChain ? [tokenFromBlockChain] : []
    const externalApiResult = !isInputStale && apiResultTokens ? apiResultTokens : []

    return {
      isLoading,
      activeListsResult: tokensFromActiveLists,
      inactiveListsResult: tokensFromInactiveLists,
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
  const activeTokens = useAtomValue(allActiveTokensAtom).tokens
  const inactiveTokens = useAtomValue(inactiveTokensAtom)

  const { data: inListsResult } = useSWR<FromListsResult>(
    ['searchTokensInLists', input, activeTokens, inactiveTokens],
    () => {
      if (!input) return emptyFromListsResult

      const filter = getTokenSearchFilter(input)
      const tokensFromActiveLists = activeTokens.filter(filter)
      const tokensFromInactiveLists = inactiveTokens.filter(filter)

      return { tokensFromActiveLists, tokensFromInactiveLists }
    },
  )

  return inListsResult || emptyFromListsResult
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useSearchTokensInApi(input: string | undefined, isTokenAlreadyFoundByAddress: boolean) {
  const { chainId } = useAtomValue(environmentAtom)

  return useSWR<TokenWithLogo[] | null>(['searchTokensInApi', input], () => {
    if (isTokenAlreadyFoundByAddress || !input) {
      return null
    }

    return searchTokensInApi(chainId, input).then((result) => parseTokensFromApi(result, chainId))
  })
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useFetchTokenFromBlockchain(input: string | undefined, isTokenAlreadyFoundByAddress: boolean) {
  const { chainId } = useAtomValue(environmentAtom)
  const provider = useWalletProvider()

  return useSWR<TokenWithLogo | null>(['fetchTokenFromBlockchain', input], () => {
    if (isTokenAlreadyFoundByAddress || !input || !provider || !isAddress(input)) {
      return null
    }

    return fetchTokenFromBlockchain(input, chainId, provider).then(TokenWithLogo.fromToken)
  })
}
