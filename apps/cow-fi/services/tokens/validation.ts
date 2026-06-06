import { PlatformData, Platforms } from 'types'
import { isAddress } from 'viem'

import { Network } from '@/const/networkMap'

type RawPlatformData = {
  contract_address?: unknown
  decimal_place?: unknown
}

type RawTokenData = {
  id: string
  name: string
  symbol: string
  detail_platforms?: unknown
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
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function isRawTokenData(value: unknown): value is RawTokenData {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.symbol === 'string' &&
    value.symbol.length > 0
  )
}

export function normalizePlatformData(value: unknown): PlatformData | null {
  if (!isObject(value)) return null

  const { contract_address: contractAddress, decimal_place: decimalPlace } = value as RawPlatformData

  if (typeof contractAddress !== 'string' || !isAddress(contractAddress)) {
    return null
  }

  return {
    contractAddress,
    decimalPlace:
      typeof decimalPlace === 'number' && Number.isInteger(decimalPlace) && decimalPlace >= 0 ? decimalPlace : 18,
  }
}

export function normalizePlatforms(detailPlatforms: unknown, networks: readonly Network[]): Platforms {
  if (!isObject(detailPlatforms)) {
    return {}
  }

  return networks.reduce<Platforms>((acc, network) => {
    const platform = normalizePlatformData(detailPlatforms[network])

    if (platform) {
      acc[network] = platform
    }

    return acc
  }, {})
}

export function normalizeOptionalUsdMetric(value: unknown): number | null {
  if (!isObject(value)) return null

  return normalizeNullableNumber(value.usd)
}

export function normalizeTokenMarketCapRank(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null
}

export function normalizeTokenSymbol(value: string): string {
  return value.toUpperCase()
}
