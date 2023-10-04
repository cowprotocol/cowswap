import { searchToken, TokenSearchResult } from '../services/searchToken'
import { useEffect, useState } from 'react'

export type TokenSearchResponse = {
  result: TokenSearchResult | undefined
  loading: boolean
  error?: Error
}

// TODO: implement search with debouncing and caching
export function useSearchToken(input: string | null): TokenSearchResponse | undefined {
  const [searchResult, setSearchResult] = useState<TokenSearchResponse | undefined>(undefined)

  useEffect(() => {
    if (!input) return

    setSearchResult({ result: undefined, loading: true })

    searchToken(input)
      .then((result) => {
        setSearchResult({ result, loading: false })
      })
      .catch((error) => {
        setSearchResult({ result: undefined, loading: false, error })
      })
  }, [input])

  return searchResult
}
