import { atom, useAtomValue, useSetAtom } from 'jotai'
import useSWR from 'swr'
import { getTokens } from './api'
import type { FetchTokensApiResult, FetchTokensResult, TokenLogoCache } from './types'

function isValidQuery(query: string): boolean {
  return typeof query === 'string' && query.length > 0
}

const tokenLogoCacheAtom = atom<TokenLogoCache>(new Map())
const tokenLogoCache = atom<TokenLogoCache, Pick<FetchTokensResult, 'chainId' | 'address' | 'logoURI'>>(
  (get) => get(tokenLogoCacheAtom),
  (get, _, { chainId, address, logoURI }) => {
    const cache = get(tokenLogoCacheAtom)
    let cacheByChainId = cache.get(chainId)

    if (!cacheByChainId) {
      cacheByChainId = new Map<string, string>()
      cache.set(chainId, cacheByChainId)
    }

    cacheByChainId.set(address.toLowerCase(), logoURI)
  }
)

export function useUniswapTokens(query: string): FetchTokensResult[] {
  const updateTokenLogoCache = useSetAtom(tokenLogoCache)
  const { data: apiResult } = useSWR<FetchTokensApiResult | null>(['uniswapTokens', query], () =>
    isValidQuery(query) ? getTokens(query) : null
  )

  // Build a logo cache.
  if (apiResult && apiResult.code === 200 && Array.isArray(apiResult.data)) {
    apiResult.data.forEach(({ chainId, address, logoURI }) => updateTokenLogoCache({ chainId, address, logoURI }))

    return apiResult.data
  }

  return []
}

export function useUniswapTokenLogo(chainId?: number, address?: string): string | undefined {
  const tokenLogos = useAtomValue(tokenLogoCache)

  if (!chainId || !address) {
    return undefined
  }

  return tokenLogos.get(chainId)?.get(address.toLowerCase())
}
