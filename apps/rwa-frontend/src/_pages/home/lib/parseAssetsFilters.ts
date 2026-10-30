import { RWA_ASSET_TYPES, type RwaAssetType } from '@/entities/asset'

export interface AssetsFilters {
  /** `null` for all types */
  type: RwaAssetType | null
  /** Empty for all issuers */
  issuers: string[]
  /** Empty for all networks */
  chainIds: number[]
  /** USD, `null` for any */
  minMarketCap: number | null
  /** USD, `null` for any */
  minVolume24h: number | null
  watchlistOnly: boolean
}

/** Keeps the valid fields of persisted filters and takes the rest from `fallback` */
export function parseAssetsFilters(value: unknown, fallback: AssetsFilters): AssetsFilters {
  if (typeof value !== 'object' || value === null) return fallback

  const { type, issuers, chainIds, minMarketCap, minVolume24h, watchlistOnly } = value as Record<string, unknown>

  return {
    type: RWA_ASSET_TYPES.find((item) => item === type) ?? fallback.type,
    issuers: isArrayOf(issuers, isString) ? issuers : fallback.issuers,
    chainIds: isArrayOf(chainIds, isPositiveInteger) ? chainIds : fallback.chainIds,
    minMarketCap: isOptionalAmount(minMarketCap) ? minMarketCap : fallback.minMarketCap,
    minVolume24h: isOptionalAmount(minVolume24h) ? minVolume24h : fallback.minVolume24h,
    watchlistOnly: typeof watchlistOnly === 'boolean' ? watchlistOnly : fallback.watchlistOnly,
  }
}

function isArrayOf<T>(value: unknown, isItem: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(isItem)
}

function isOptionalAmount(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0)
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}
