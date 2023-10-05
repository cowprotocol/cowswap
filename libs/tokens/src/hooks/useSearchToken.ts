import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { activeTokensAtom, inactiveTokensAtom } from '../state/tokensAtom'
import { useDebounce } from '@cowprotocol/common-hooks'
import ms from 'ms.macro'
import { getTokenSearchFilter } from '../utils/getTokenSearchFilter'
import useSWR from 'swr'
import { searchTokensInApi, TokenSearchFromApiResult } from '../services/searchTokensInApi'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { tokensListsEnvironmentAtom } from '../state/tokensListsEnvironmentAtom'
import { parseTokensFromApi } from '../utils/parseTokensFromApi'

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
// TODO: add search from blockchain
export function useSearchToken(input: string | null): TokenSearchResponse {
  const debouncedInputInList = useDebounce(input, IN_LISTS_DEBOUNCE_TIME)
  const debouncedInputInExternals = useDebounce(input, IN_EXTERNALS_DEBOUNCE_TIME)
  const { chainId } = useAtomValue(tokensListsEnvironmentAtom)
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

  const { data: apiResult, isLoading } = useSWR<TokenSearchFromApiResult[] | null>(
    ['searchTokensInApi', debouncedInputInExternals],
    () => {
      if (!debouncedInputInExternals) return null

      return searchTokensInApi(debouncedInputInExternals)
    }
  )

  const apiResultTokens = useMemo(() => {
    if (!apiResult?.length) return null

    return parseTokensFromApi(apiResult, chainId)
  }, [apiResult, chainId])

  return useMemo(() => {
    if (!input) {
      return emptyResponse
    }

    return {
      isLoading,
      blockchainResult: null,
      activeListsResult: inListsResult?.tokensFromActiveLists || null,
      inactiveListsResult: inListsResult?.tokensFromInactiveLists || null,
      externalApiResult: apiResultTokens,
    }
  }, [input, inListsResult, apiResultTokens, isLoading])
}
