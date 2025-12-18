import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { TokenInfo } from '@cowprotocol/types'

import {
  getTokenId,
  RestrictedTokenListState,
  setRestrictedTokensAtom,
  TokenId,
} from '../../state/restrictedTokens/restrictedTokensAtom'

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

async function fetchTokenList(url: string): Promise<TokenInfo[]> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch token list from ${url}: ${response.statusText}`)
  }
  const data: TokenListResponse = await response.json()
  return data.tokens
}

export function RestrictedTokensListUpdater(): null {
  const setRestrictedTokens = useSetAtom(setRestrictedTokensAtom)

  useEffect(() => {
    async function loadRestrictedTokens(): Promise<void> {
      try {
        const restrictedLists = await fetchRestrictedListsMetadata()

        const tokensMap: Record<TokenId, TokenInfo> = {}
        const countriesPerToken: Record<TokenId, string[]> = {}
        const issuerPerToken: Record<TokenId, string> = {}
        const tosHashPerToken: Record<TokenId, string> = {}

        await Promise.all(
          restrictedLists.map(async (list) => {
            try {
              const tokens = await fetchTokenList(list.tokenListUrl)

              for (const token of tokens) {
                const tokenId = getTokenId(token.chainId, token.address)
                tokensMap[tokenId] = token
                countriesPerToken[tokenId] = list.restrictedCountries
                issuerPerToken[tokenId] = list.name
                tosHashPerToken[tokenId] = TERMS_OF_SERVICE_HASH
              }
            } catch (error) {
              console.error(`Failed to fetch token list for ${list.name}:`, error)
            }
          }),
        )

        const listState: RestrictedTokenListState = {
          tokensMap,
          countriesPerToken,
          issuerPerToken,
          tosHashPerToken,
          isLoaded: true,
        }

        setRestrictedTokens(listState)
      } catch (error) {
        console.error('Error loading restricted tokens:', error)
      }
    }

    loadRestrictedTokens()
  }, [setRestrictedTokens])

  return null
}
