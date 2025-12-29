import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { getRestrictedTokenLists } from '@cowprotocol/core'
import { TokenInfo } from '@cowprotocol/types'

import { normalizeListSource } from '../../hooks/lists/useIsListBlocked'
import { useRestrictedTokensCache } from '../../hooks/useRestrictedTokensCache'
import {
  getTokenId,
  restrictedListsAtom,
  RestrictedTokenListState,
  TokenId,
} from '../../state/restrictedTokens/restrictedTokensAtom'

const FETCH_TIMEOUT_MS = 10_000
const MAX_RETRIES = 1
const RETRY_DELAY_MS = 1_000

// IPFS hash of the current consent terms - shared across all restricted token issuers
export const RWA_CONSENT_HASH = 'bafkreidcn4bhj44nnethx6clfspkapahshqyq44adz674y7je5wyfiazsq'

export interface RestrictedTokensListUpdaterProps {
  isRwaGeoblockEnabled: boolean | undefined
}

interface TokenListResponse {
  tokens: TokenInfo[]
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchTokenList(url: string, retries = MAX_RETRIES): Promise<TokenInfo[]> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, FETCH_TIMEOUT_MS)

      if (!response.ok) {
        throw new Error(`Failed to fetch token list from ${url}: ${response.statusText}`)
      }

      const data: TokenListResponse = await response.json()

      if (!data.tokens || !Array.isArray(data.tokens)) {
        throw new Error(`Invalid token list response from ${url}: tokens is not an array`)
      }

      return data.tokens
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on validation errors
      if (lastError.message.includes('tokens is not an array')) {
        throw lastError
      }

      // Wait before retrying (except on last attempt)
      if (attempt < retries - 1) {
        await delay(RETRY_DELAY_MS * (attempt + 1))
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch token list from ${url} after ${retries} attempts`)
}

export function RestrictedTokensListUpdater({ isRwaGeoblockEnabled }: RestrictedTokensListUpdaterProps): null {
  const { shouldFetch: shouldFetchTokens, saveToCache } = useRestrictedTokensCache()
  const setRestrictedLists = useSetAtom(restrictedListsAtom)
  const restrictedLists = useAtomValue(restrictedListsAtom)

  // Also fetch if lists atom isn't loaded (it's not cached, only tokens are)
  const shouldFetch = shouldFetchTokens || !restrictedLists.isLoaded

  useEffect(() => {
    if (!isRwaGeoblockEnabled) {
      return
    }

    if (!shouldFetch) {
      return
    }

    async function loadRestrictedTokens(): Promise<void> {
      try {
        const restrictedLists = await getRestrictedTokenLists()

        const tokensMap: Record<TokenId, TokenInfo> = {}
        const countriesPerToken: Record<TokenId, string[]> = {}
        const consentHashPerToken: Record<TokenId, string> = {}
        const blockedCountriesPerList: Record<string, string[]> = {}
        const consentHashPerList: Record<string, string> = {}

        await Promise.all(
          restrictedLists.map(async (list) => {
            const normalizedUrl = normalizeListSource(list.tokenListUrl)
            blockedCountriesPerList[normalizedUrl] = list.restrictedCountries
            consentHashPerList[normalizedUrl] = RWA_CONSENT_HASH

            try {
              const tokens = await fetchTokenList(list.tokenListUrl)

              for (const token of tokens) {
                const tokenId = getTokenId(token.chainId, token.address)
                tokensMap[tokenId] = token
                countriesPerToken[tokenId] = list.restrictedCountries
                consentHashPerToken[tokenId] = RWA_CONSENT_HASH
              }
            } catch (error) {
              console.error(`Failed to fetch token list for ${list.name}:`, error)
            }
          }),
        )

        const listState: RestrictedTokenListState = {
          tokensMap,
          countriesPerToken,
          consentHashPerToken,
          isLoaded: true,
        }

        setRestrictedLists({
          blockedCountriesPerList,
          consentHashPerList,
          isLoaded: true,
        })

        saveToCache(listState)
      } catch (error) {
        console.error('Error loading restricted tokens:', error)
      }
    }

    loadRestrictedTokens()
  }, [isRwaGeoblockEnabled, shouldFetch, saveToCache, setRestrictedLists])

  return null
}
