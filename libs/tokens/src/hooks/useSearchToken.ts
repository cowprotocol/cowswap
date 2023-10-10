import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { activeTokensAtom, inactiveTokensAtom } from '../state/tokens/tokensAtom'
import { useDebounce } from '@cowprotocol/common-hooks'
import { useWeb3React } from '@web3-react/core'
import { isAddress } from '@cowprotocol/common-utils'
import ms from 'ms.macro'
import { getTokenSearchFilter } from '../utils/getTokenSearchFilter'
import useSWR from 'swr'
import { searchTokensInApi } from '../services/searchTokensInApi'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { environmentAtom } from '../state/environmentAtom'
import { parseTokensFromApi } from '../utils/parseTokensFromApi'
import { fetchTokenFromBlockchain } from '../utils/fetchTokenFromBlockchain'
import { tokenWithLogoFromToken } from '../utils/tokenWithLogoFromToken'

const IN_LISTS_DEBOUNCE_TIME = ms`100ms`
const IN_EXTERNALS_DEBOUNCE_TIME = ms`1s`

export type TokenSearchResponse = {
  isLoading: boolean
  blockchainResult: TokenWithLogo[] | null
  externalApiResult: TokenWithLogo[] | null
  activeListsResult: TokenWithLogo[] | null
  inactiveListsResult: TokenWithLogo[] | null
}

type FromListsResult = {
  tokensFromActiveLists: TokenWithLogo[]
  tokensFromInactiveLists: TokenWithLogo[]
}

const emptyResponse: TokenSearchResponse = {
  isLoading: false,
  blockchainResult: null,
  externalApiResult: null,
  activeListsResult: null,
  inactiveListsResult: null,
}

const emptyFromListsResult: FromListsResult = { tokensFromActiveLists: [], tokensFromInactiveLists: [] }

export function useSearchToken(input: string | null): TokenSearchResponse {
  const debouncedInputInList = useDebounce(input?.toLowerCase(), IN_LISTS_DEBOUNCE_TIME)
  const debouncedInputInExternals = useDebounce(input?.toLowerCase(), IN_EXTERNALS_DEBOUNCE_TIME)

  // Search in active and inactive lists
  const { tokensFromActiveLists, tokensFromInactiveLists } = useSearchTokensInLists(debouncedInputInList)

  const isTokenAlreadyFound = useMemo(() => {
    return tokensFromActiveLists.some((token) => token.address.toLowerCase() === debouncedInputInList)
  }, [debouncedInputInList, tokensFromActiveLists])

  // Search in external API
  const { data: apiResultTokens, isLoading: apiIsLoading } = useSearchTokensInApi(
    debouncedInputInExternals,
    isTokenAlreadyFound
  )

  // Search in Blockchain
  const { data: tokenFromBlockChain, isLoading: blockchainIsLoading } = useFetchTokenFromBlockchain(
    debouncedInputInExternals,
    isTokenAlreadyFound
  )

  return useMemo(() => {
    if (!debouncedInputInList) {
      return emptyResponse
    }

    if (isTokenAlreadyFound) {
      return {
        isLoading: apiIsLoading || blockchainIsLoading,
        activeListsResult: tokensFromActiveLists,
        blockchainResult: null,
        inactiveListsResult: null,
        externalApiResult: null,
      }
    }

    return {
      isLoading: apiIsLoading || blockchainIsLoading,
      blockchainResult: tokenFromBlockChain ? [tokenFromBlockChain] : null,
      activeListsResult: tokensFromActiveLists,
      inactiveListsResult: tokensFromInactiveLists,
      externalApiResult: apiResultTokens || null,
    }
  }, [
    debouncedInputInList,
    isTokenAlreadyFound,
    tokensFromActiveLists,
    tokensFromInactiveLists,
    apiResultTokens,
    tokenFromBlockChain,
    apiIsLoading,
    blockchainIsLoading,
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

function useSearchTokensInApi(input: string | undefined, isTokenAlreadyFound: boolean) {
  const { chainId } = useAtomValue(environmentAtom)

  return useSWR<TokenWithLogo[] | null>(['searchTokensInApi', input], () => {
    if (isTokenAlreadyFound || !input) {
      return null
    }

    return searchTokensInApi(input).then((result) => parseTokensFromApi(result, chainId))
  })
}

function useFetchTokenFromBlockchain(input: string | undefined, isTokenAlreadyFound: boolean) {
  const { chainId } = useAtomValue(environmentAtom)
  const { provider } = useWeb3React()

  return useSWR<TokenWithLogo | null>(['fetchTokenFromBlockchain', input], () => {
    if (isTokenAlreadyFound || !input || !provider || !isAddress(input)) {
      return null
    }

    return fetchTokenFromBlockchain(input, chainId, provider).then(tokenWithLogoFromToken)
  })
}
