import { atom, useAtomValue, useSetAtom } from 'jotai'
import useSWR from 'swr'
import { getTokens } from './api'
import type { Chain, FetchTokensApiResult, FetchTokensResult, TokenLogoCache } from './types'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { isAddress } from '@src/utils'
import * as Sentry from '@sentry/react'

function isValidQuery(query: string): boolean {
  return typeof query === 'string' && query.length > 0
}

const SUPPORTED_CHAINS: Partial<Record<Chain, SupportedChainId>> = {
  ETHEREUM: SupportedChainId.MAINNET,
  ETHEREUM_GOERLI: SupportedChainId.GOERLI,
} as const

const UNSUPPORTED_CHAIN_ID = null

// This function will verify if the API response matches our expectations.
// As we are using an external party, and their responses may change arbitrarily,
// we should ensure that there is a check so that the application can rely on this abstraction.
function isValidFetchTokensResult(token: any): token is FetchTokensResult {
  // Verify if token is of correct type
  if (typeof token !== 'object' || token === null) {
    return false
  }

  // Verify if token has the expected fields.
  if (!token.chainId || !token.address) {
    return false
  }

  const hasValidChainId = token.chainId !== UNSUPPORTED_CHAIN_ID && typeof token.chainId === 'number'

  // API we are using supports other chains such as Arbitrum as well. Verify that the chainId is something we have on our systems.
  const hasSupportedChainId = token.chainId === SupportedChainId.MAINNET || token.chainId === SupportedChainId.GOERLI

  const hasValidAddress = typeof token.address === 'string' && !!isAddress(token.address)

  return hasValidChainId && hasSupportedChainId && hasValidAddress
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

  try {
    if (apiResult && Array.isArray(apiResult.searchTokens)) {
      const result = apiResult.searchTokens
        .map((token) => ({ ...token, chainId: chainToChainId(token.chain) }))
        .filter(isValidFetchTokensResult)

      // Build a logo cache.
      result.forEach(({ chainId, address, project }) => updateTokenLogoCache({ chainId, address, project }))

      return result
    }

    return []
  } catch (error: unknown) {
    Sentry.captureException(error)
    return []
  }
}

export function useProxyTokenLogo(chainId?: number, address?: string): string | undefined {
  const tokenLogos = useAtomValue(tokenLogoCache)

  try {
    if (!chainId || !address) {
      return undefined
    }

    return tokenLogos.get(chainId)?.get(address.toLowerCase())
  } catch (error: unknown) {
    Sentry.captureException(error)
    return undefined
  }
}
