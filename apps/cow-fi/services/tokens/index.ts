'use server'

import fs from 'fs'
import path from 'path'
import { PlatformData, Platforms, TokenDetails, TokenInfo } from 'types'
import { backOff } from 'exponential-backoff'
import { DATA_CACHE_TIME_SECONDS } from '@/const/meta'

const NETWORKS = ['ethereum', 'xdai']
const COW_TOKEN_ID = 'cow-protocol'

const TOKEN_LISTS_URL = 'https://files.cow.fi/tokens/cowFi-tokens.json'
const DESCRIPTIONS_DIR_PATH = path.join(process.cwd(), 'data', 'descriptions')

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

  let sortedTokens = tokens.sort(_sortTokensInfoByMarketCap)

  // Move COW at the top
  sortedTokens.unshift(
    tokens.splice(
      tokens.findIndex((item) => item.id === COW_TOKEN_ID),
      1,
    )[0],
  )

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

async function fetchWithBackoff(url: string) {
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
  const tokenRawData = await fetchWithBackoff(TOKEN_LISTS_URL)

  // Get manual descriptions
  const descriptionFilePaths = _getDescriptionFilePaths()
  const descriptionFiles = descriptionFilePaths.map((f) => f.replace('.md', ''))

  // Enhance description and transform to token details
  const tokens = tokenRawData
    .map((tokenRaw: TokenDetails) => {
      if (!descriptionFiles.includes(tokenRaw.id)) {
        return undefined
      }

      // Add generated descriptions
      const description = _getTokenDescription(tokenRaw.id)

      return _toTokenDetails(tokenRaw, description)
    })
    .filter(Boolean) // Not falsy

  return tokens
}

function _getTokenDescription(id: string): string {
  const filePath = path.join(DESCRIPTIONS_DIR_PATH, `${id}.md`)
  return fs.readFileSync(filePath, 'utf-8')
}

function _toTokenDetails(tokenRaw: any, description: string): TokenDetails {
  // Add platform information
  const detailPlatforms = tokenRaw.detail_platforms

  const platforms = NETWORKS.reduce<Platforms>((acc, network) => {
    const platformRaw = detailPlatforms[network]
    if (platformRaw) {
      acc[network] = _toPlatform(platformRaw)
    }

    return acc
  }, {})

  // Return the details
  const marketData = tokenRaw.market_data
  const token = {
    id: tokenRaw.id,
    name: tokenRaw.name,
    symbol: tokenRaw.symbol?.toUpperCase(),
    description,
    metaDescription: '',
    // description: description || token?.description?.en || token?.ico_data?.desc || '-', // Replicate old behavior (but not needed, since manual description is always required, leaving for now to double check with Nenad)
    marketCapRank: tokenRaw.market_cap_rank,
    marketCap: marketData?.market_cap?.usd ?? null,
    allTimeHigh: marketData?.ath.usd ?? null,
    allTimeLow: marketData?.atl.usd ?? null,
    volume: marketData?.total_volume?.usd ?? null,
    priceUsd: marketData?.current_price?.usd ?? null,
    change24h: marketData?.price_change_percentage_24h ?? null,
    image: {
      large: tokenRaw?.image?.large ?? null,
    },
    platforms,
  }

  return { ...token }
}

function _toTokenInfo(token: TokenDetails): TokenInfo {
  const { id, name, symbol, image, marketCapRank, priceUsd, change24h, volume, marketCap } = token

  return { id, name, symbol, image, marketCapRank, priceUsd, change24h, volume, marketCap }
}

function _toPlatform(platform: any): PlatformData {
  return {
    contractAddress: platform.contract_address || '',
    decimalPlace: platform.decimal_place || 18,
  }
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
