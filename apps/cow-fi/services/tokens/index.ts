'use server'

import { COW_CDN } from '@cowprotocol/common-const'

import { backOff } from 'exponential-backoff'
import { TokenDetails, TokenInfo } from 'types'

import fs from 'fs'
import path from 'path'

import {
  isRawTokenData,
  normalizeOptionalUsdMetric,
  normalizePlatforms,
  normalizeTokenMarketCapRank,
  normalizeTokenSymbol,
} from './validation'

import { DATA_CACHE_TIME_SECONDS } from '@/const/meta'
import { Network } from '@/const/networkMap'

const NETWORKS: Network[] = ['ethereum', 'base', 'arbitrum-one', 'avalanche', 'polygon-pos', 'xdai']
const COW_TOKEN_ID = 'cow-protocol'

const TOKEN_LISTS_URL = `${COW_CDN}/tokens/cowFi-tokens.json`
const DESCRIPTIONS_DIR_PATH = path.join(process.cwd(), 'data', 'descriptions')

function isTokenDetails(value: TokenDetails | undefined): value is TokenDetails {
  return Boolean(value)
}

/**
 *
 * @returns All token ids
 */
export async function getTokensIds(): Promise<string[]> {
  const tokensRaw = await _getAllTokensData()
  return tokensRaw.map(({ id }) => id)
}

/**
 *
 * @returns All token info sorted by market cap, with COW at the top
 */
export async function getTokensInfo(): Promise<TokenInfo[]> {
  const tokensRaw = await _getAllTokensData()
  const tokens = tokensRaw.map(_toTokenInfo)

  const sortedTokens = tokens.sort(_sortTokensInfoByMarketCap)
  const cowTokenIndex = sortedTokens.findIndex((item) => item.id === COW_TOKEN_ID)

  if (cowTokenIndex > 0) {
    const [cowToken] = sortedTokens.splice(cowTokenIndex, 1)
    sortedTokens.unshift(cowToken)
  }

  return sortedTokens
}

/**
 *
 * @param coingeckoId id of the token
 *
 * @returns token details for the given token id
 */
export async function getTokenDetails(coingeckoId: string): Promise<TokenDetails | undefined> {
  const id = coingeckoId.toLowerCase()
  const tokensRaw = await _getAllTokensData()
  return tokensRaw.find(({ id: _id }) => _id === id) as TokenDetails | undefined
}

function _getDescriptionFilePaths(): string[] {
  return fs.readdirSync(DESCRIPTIONS_DIR_PATH, 'utf-8')
}

async function fetchWithBackoff(url: string): Promise<unknown> {
  return backOff(
    () => {
      return fetch(url, {
        next: { revalidate: DATA_CACHE_TIME_SECONDS },
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`Error fetching list ${url}: Error ${res.status}, ${res.statusText}`)
        }

        return res.json()
      })
    },
    {
      retry: (e, attemptNum) => {
        console.log(`Error fetching ${url}, attempt ${attemptNum}. Retrying soon...`, e)
        return true
      },
    },
  )
}

async function _getAllTokensData(): Promise<TokenDetails[]> {
  let tokenRawData: unknown

  try {
    tokenRawData = await fetchWithBackoff(TOKEN_LISTS_URL)
  } catch (error) {
    console.error('[cow-fi] Failed to fetch token list, skipping token data generation.', error)
    return []
  }

  if (!Array.isArray(tokenRawData)) {
    console.error('[cow-fi] Token list payload was not an array')
    return []
  }

  // Get manual descriptions
  const descriptionFilePaths = _getDescriptionFilePaths()
  const descriptionFiles = descriptionFilePaths.map((f) => f.replace('.md', ''))

  // Enhance description and transform to token details
  const tokens = tokenRawData
    .map((tokenRaw) => {
      if (!isRawTokenData(tokenRaw)) {
        return undefined
      }

      // if the token does not have a description file, skip it
      if (!descriptionFiles.includes(tokenRaw.id)) {
        return undefined
      }

      // Add generated descriptions
      const description = _getTokenDescription(tokenRaw.id)

      return _toTokenDetails(tokenRaw, description)
    })
    .filter(isTokenDetails)

  return tokens
}

function _getTokenDescription(id: string): string {
  const filePath = path.join(DESCRIPTIONS_DIR_PATH, `${id}.md`)
  return fs.readFileSync(filePath, 'utf-8')
}

function _toTokenDetails(
  tokenRaw: {
    detail_platforms?: unknown
    id: string
    image?: {
      large?: unknown
    }
    market_cap_rank?: unknown
    market_data?: {
      ath?: {
        usd?: unknown
      }
      atl?: {
        usd?: unknown
      }
      current_price?: {
        usd?: unknown
      }
      market_cap?: {
        usd?: unknown
      }
      price_change_percentage_24h?: unknown
      total_volume?: {
        usd?: unknown
      }
    }
    name: string
    symbol: string
  },
  description: string,
): TokenDetails {
  const platforms = normalizePlatforms(tokenRaw.detail_platforms, NETWORKS)
  const marketData = tokenRaw.market_data
  const change24h = marketData?.price_change_percentage_24h

  return {
    id: tokenRaw.id,
    name: tokenRaw.name,
    symbol: normalizeTokenSymbol(tokenRaw.symbol),
    description,
    marketCapRank: normalizeTokenMarketCapRank(tokenRaw.market_cap_rank),
    marketCap: normalizeOptionalUsdMetric(marketData?.market_cap),
    allTimeHigh: normalizeOptionalUsdMetric(marketData?.ath),
    allTimeLow: normalizeOptionalUsdMetric(marketData?.atl),
    volume: normalizeOptionalUsdMetric(marketData?.total_volume),
    priceUsd: normalizeOptionalUsdMetric(marketData?.current_price),
    change24h: typeof change24h === 'number' && Number.isFinite(change24h) ? change24h : null,
    image: {
      large: typeof tokenRaw.image?.large === 'string' ? tokenRaw.image.large : null,
    },
    platforms,
  }
}

function _toTokenInfo(token: TokenDetails): TokenInfo {
  const { id, name, symbol, image, marketCapRank, priceUsd, change24h, volume, marketCap } = token

  return { id, name, symbol, image, marketCapRank, priceUsd, change24h, volume, marketCap }
}

function _sortTokensInfoByMarketCap(a: TokenInfo, b: TokenInfo): number {
  // Sort by market cap
  if (a.marketCapRank === null) {
    return 1 // always place nulls last
  }
  if (b.marketCapRank === null) {
    return -1 // always place nulls last
  }
  return a.marketCapRank - b.marketCapRank // usual comparison
}
