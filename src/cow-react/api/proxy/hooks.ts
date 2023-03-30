import { atom, useAtomValue, useSetAtom } from 'jotai'
import useSWR from 'swr'
import { getTokens } from './api'
import type { Chain, FetchTokensApiResult, FetchTokensResult, TokenLogoCache } from './types'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

function isValidQuery(query: string): boolean {
  return typeof query === 'string' && query.length > 0
}

const SUPPORTED_CHAINS: Partial<Record<Chain, SupportedChainId>> = {
  ETHEREUM: SupportedChainId.MAINNET,
  ETHEREUM_GOERLI: SupportedChainId.GOERLI,
} as const

const UNSUPPORTED_CHAIN_ID = null

function hasSupportedChainId(token: any): token is FetchTokensResult {
  return token?.chainId !== UNSUPPORTED_CHAIN_ID
}

function chainToChainId(chain: Chain) {
  const chainId = SUPPORTED_CHAINS[chain]

  return chainId ?? UNSUPPORTED_CHAIN_ID
}

const tokenLogoCacheAtom = atom<TokenLogoCache>(new Map())
const tokenLogoCache = atom<TokenLogoCache, Pick<FetchTokensResult, 'chainId' | 'address' | 'project'>>(
  (get) => get(tokenLogoCacheAtom),
  (get, _, { chainId, address, project: { logoUrl } }) => {
    const cache = get(tokenLogoCacheAtom)
    let cacheByChainId = cache.get(chainId)

    if (!cacheByChainId) {
      cacheByChainId = new Map<string, string>()
      cache.set(chainId, cacheByChainId)
    }

    cacheByChainId.set(address.toLowerCase(), logoUrl)
  }
)

export function useProxyTokens(query: string): FetchTokensResult[] {
  const updateTokenLogoCache = useSetAtom(tokenLogoCache)
  const { data: apiResult } = useSWR<FetchTokensApiResult | null>(['uniswapTokens', query], () =>
    isValidQuery(query) ? getTokens(query) : null
  )

  if (apiResult && Array.isArray(apiResult.searchTokens)) {
    const result = apiResult.searchTokens
      .map((token) => ({ ...token, chainId: chainToChainId(token.chain) }))
      .filter(hasSupportedChainId)

    // Build a logo cache.
    result.forEach(({ chainId, address, project }) => updateTokenLogoCache({ chainId, address, project }))

    return result
  }

  return []
}

export function useProxyTokenLogo(chainId?: number, address?: string): string | undefined {
  const tokenLogos = useAtomValue(tokenLogoCache)

  if (!chainId || !address) {
    return undefined
  }

  return tokenLogos.get(chainId)?.get(address.toLowerCase())
}
