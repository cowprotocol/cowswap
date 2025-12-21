import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { TokenInfo } from '@cowprotocol/types'

import useSWR from 'swr'

import {
  getTokenId,
  RestrictedTokenListState,
  restrictedTokensAtom,
  restrictedTokensLastUpdateAtom,
  setRestrictedTokensAtom,
  TokenId,
} from '../../state/restrictedTokens/restrictedTokensAtom'

const FETCH_TIMEOUT_MS = 10_000
const MAX_RETRIES = 1
const RETRY_DELAY_MS = 1_000
const UPDATE_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

// Hardcoded IPFS hash of the consent terms - shared across all restricted token issuers
const TERMS_OF_SERVICE_HASH = 'bafkreidcn4bhj44nnethx6clfspkapahshqyq44adz674y7je5wyfiazsq'

interface RestrictedListMetadata {
  name: string
  tokenListUrl: string
  restrictedCountries: string[]
}

interface TokenListResponse {
  tokens: TokenInfo[]
}

// TODO: Replace with actual endpoint
async function fetchRestrictedListsMetadata(): Promise<RestrictedListMetadata[]> {
  // Mocked response - will be replaced with actual fetch
  return [
    {
      name: 'Ondo Finance',
      tokenListUrl:
        'https://raw.githubusercontent.com/ondoprotocol/cowswap-global-markets-token-list/refs/heads/main/tokenlist.json',
      restrictedCountries: [
        'AF',
        'DZ',
        'BY',
        'CA',
        'CN',
        'CU',
        'KP',
        'ER',
        'IR',
        'LY',
        'MM',
        'MA',
        'NP',
        'RU',
        'SO',
        'SS',
        'SD',
        'SY',
        'US',
        'VE',
        'AT',
        'BE',
        'BG',
        'HR',
        'CY',
        'CZ',
        'DK',
        'EE',
        'FI',
        'FR',
        'DE',
        'GR',
        'HU',
        'IE',
        'IT',
        'LV',
        'LT',
        'LU',
        'MT',
        'NL',
        'PL',
        'PT',
        'RO',
        'SK',
        'SI',
        'ES',
        'SE',
      ],
    },
  ]
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

      // Validate response structure
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
        await delay(RETRY_DELAY_MS * (attempt + 1)) // Exponential backoff
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch token list from ${url} after ${retries} attempts`)
}

function getIsTimeToUpdate(lastUpdateTime: number): boolean {
  if (!lastUpdateTime) return true
  return Date.now() - lastUpdateTime > UPDATE_INTERVAL_MS
}

async function loadRestrictedTokensData(): Promise<RestrictedTokenListState> {
  const restrictedLists = await fetchRestrictedListsMetadata()

  const tokensMap: Record<TokenId, TokenInfo> = {}
  const countriesPerToken: Record<TokenId, string[]> = {}
  const tosHashPerToken: Record<TokenId, string> = {}

  await Promise.all(
    restrictedLists.map(async (list) => {
      try {
        const tokens = await fetchTokenList(list.tokenListUrl)

        for (const token of tokens) {
          const tokenId = getTokenId(token.chainId, token.address)
          tokensMap[tokenId] = token
          countriesPerToken[tokenId] = list.restrictedCountries
          tosHashPerToken[tokenId] = TERMS_OF_SERVICE_HASH
        }
      } catch (error) {
        console.error(`Failed to fetch token list for ${list.name}:`, error)
      }
    }),
  )

  return {
    tokensMap,
    countriesPerToken,
    tosHashPerToken,
    isLoaded: true,
  }
}

export function RestrictedTokensListUpdater(): null {
  const setRestrictedTokens = useSetAtom(setRestrictedTokensAtom)
  const cachedState = useAtomValue(restrictedTokensAtom)
  const lastUpdateTime = useAtomValue(restrictedTokensLastUpdateAtom)
  const setLastUpdateTime = useSetAtom(restrictedTokensLastUpdateAtom)

  const hasCachedData = cachedState?.isLoaded && Object.keys(cachedState?.tokensMap || {}).length > 0

  const { data } = useSWR(
    ['RestrictedTokensListUpdater', lastUpdateTime, hasCachedData],
    () => {
      if (hasCachedData && !getIsTimeToUpdate(lastUpdateTime)) return null
      return loadRestrictedTokensData()
    },
    { revalidateOnFocus: false, refreshInterval: UPDATE_INTERVAL_MS },
  )

  useEffect(() => {
    if (!data) return

    setRestrictedTokens(data)
    setLastUpdateTime(Date.now())
  }, [data, setRestrictedTokens, setLastUpdateTime])

  return null
}
