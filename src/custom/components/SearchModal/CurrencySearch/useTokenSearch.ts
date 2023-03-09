import { useWalletInfo } from '@cow/modules/wallet'
import { Token } from '@uniswap/sdk-core'
import { atom, useAtom, useAtomValue } from 'jotai'
import { loadable } from 'jotai/utils'
import { useEffect, useMemo } from 'react'

const BASE_URL = 'https://temp.api.uniswap.org/v1/tokens/search?tokenQuery='

type Address = `0x${string}`

interface FetchTokensResult {
  chainId: number
  name: string
  address: Address
  decimals: number
  symbol: string
  logoURI: string
  coinGeckoId: string
  priceUsd: number
  price24hChange: number
  volume24h: number
  marketCap: number
}

interface FetchTokensApiResult {
  code: number
  status: 'success' | 'failed'
  hasNext: boolean
  data: FetchTokensResult[]
}

async function fetchTokens(query: string): Promise<FetchTokensApiResult> {
  const response = await fetch(`${BASE_URL}${query}`)

  return await response.json()
}

const searchQuery = atom('')

const tokensData = loadable(
  atom(async (get) => {
    const query = get(searchQuery)

    if (query.length > 0) {
      return await fetchTokens(query)
    }

    return undefined
  })
)

export function useTokenSearch(_query: string, existingTokens: Map<string, boolean>): Token[] {
  const [query, setQuery] = useAtom(searchQuery)
  const { chainId: currentChainId } = useWalletInfo()
  // query is being used through jotai
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const result = useAtomValue(useMemo(() => tokensData, [query]))
  const tokens = useMemo(() => {
    if (result.state !== 'hasData' || result.data === undefined || !Array.isArray(result.data.data)) {
      return []
    }

    const { data } = result.data

    return data
      .filter(({ address, chainId }) => !existingTokens.get(address) && chainId === currentChainId)
      .map(({ chainId, address, decimals, symbol, name }) => new Token(chainId, address, decimals, symbol, name))
  }, [result, existingTokens, currentChainId])

  useEffect(() => {
    setQuery(_query)
  }, [setQuery, _query])

  return tokens
}
