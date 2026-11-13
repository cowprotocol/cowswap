import type {
  RwaAsset,
  RwaAssetListItem,
  RwaAssetsFilter,
  RwaAssetWithMarket,
  RwaSortField,
  RwaSortOrder,
} from './types'

import { getEditDistance } from '@/shared/lib/text'

const TEXT_SORT_FIELDS: readonly RwaSortField[] = ['ticker', 'title']

const MIN_DESCRIPTION_QUERY_LENGTH = 3
const MIN_FUZZY_QUERY_LENGTH = 4
const LONG_FUZZY_QUERY_LENGTH = 8
/** Lowest score of a ticker, title or token symbol match (`getFieldScore`) */
const MIN_FIELD_SCORE = 3

type SortValueGetter = (asset: RwaAssetListItem) => number | string | null

const SORT_VALUE_GETTERS: Record<RwaSortField, SortValueGetter> = {
  priority: (asset) => asset.priority,
  marketCap: (asset) => asset.market?.marketCap ?? null,
  volume24h: (asset) => asset.market?.volume24h ?? null,
  change24h: (asset) => asset.market?.change24h ?? null,
  price: (asset) => asset.market?.price ?? null,
  ticker: (asset) => asset.ticker,
  title: (asset) => asset.title,
}

export function filterAssets<T extends RwaAsset>(assets: T[], filter: RwaAssetsFilter): T[] {
  const needle = filter.query?.trim().toLowerCase()
  const filtered = assets.filter(
    (asset) =>
      (!filter.type || asset.type === filter.type) &&
      (!filter.tickers || filter.tickers.includes(asset.ticker)) &&
      hasMatchingToken(asset, filter),
  )

  if (!needle) return filtered

  const scored = filtered.map((asset) => ({ asset, score: getSearchScore(asset, needle) }))
  // The table is sorted by its column, not by score: description and typo matches only when nothing else matches
  const minScore = scored.some(({ score }) => score >= MIN_FIELD_SCORE) ? MIN_FIELD_SCORE : 1

  return scored.filter(({ score }) => score >= minScore).map(({ asset }) => asset)
}

/** An asset without market data matches no minimum */
export function filterByMarket<T extends RwaAssetWithMarket>(
  assets: T[],
  { minMarketCap, minVolume24h }: RwaAssetsFilter,
): T[] {
  return assets.filter(
    ({ market }) =>
      isAtLeast(market?.marketCap ?? null, minMarketCap) && isAtLeast(market?.volume24h ?? null, minVolume24h),
  )
}

export function getDefaultSortOrder(sort: RwaSortField): RwaSortOrder {
  return TEXT_SORT_FIELDS.includes(sort) ? 'asc' : 'desc'
}

export function paginate<T>(items: T[], page: number, pageSize: number): { items: T[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const start = (page - 1) * pageSize

  return { items: items.slice(start, start + pageSize), totalPages }
}

export function searchAssets<T extends RwaAsset>(assets: T[], query: string): T[] {
  const needle = query.trim().toLowerCase()

  if (!needle) return []

  const scored = assets.flatMap((asset) => {
    const score = getSearchScore(asset, needle)

    return score ? [{ asset, score }] : []
  })

  return scored.sort((a, b) => b.score - a.score || b.asset.priority - a.asset.priority).map(({ asset }) => asset)
}

export function sortAssets(assets: RwaAssetListItem[], sort: RwaSortField, order: RwaSortOrder): RwaAssetListItem[] {
  const getValue = SORT_VALUE_GETTERS[sort]
  const direction = order === 'asc' ? 1 : -1

  return [...assets].sort((a, b) => {
    const valueA = getValue(a)
    const valueB = getValue(b)

    // Assets without market data always go last regardless of the order
    if (valueA === null || valueB === null) {
      if (valueA === valueB) return a.ticker.localeCompare(b.ticker)

      return valueA === null ? 1 : -1
    }

    return compareValues(valueA, valueB) * direction || a.ticker.localeCompare(b.ticker)
  })
}

function compareValues(a: number | string, b: number | string): number {
  if (typeof a === 'string' || typeof b === 'string') {
    return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' })
  }

  return a - b
}

function getFieldScore(ticker: string, title: string, symbols: string[], needle: string): number {
  if (ticker === needle) return 6
  if (ticker.startsWith(needle) || symbols.some((symbol) => symbol.startsWith(needle))) return 5
  if (title.startsWith(needle)) return 4
  if (ticker.includes(needle) || title.includes(needle) || symbols.some((symbol) => symbol.includes(needle))) return 3

  return 0
}

function getSearchScore(asset: RwaAsset, needle: string): number {
  const ticker = asset.ticker.toLowerCase()
  const title = asset.title.toLowerCase()
  const symbols = asset.tokens.map((token) => token.symbol.toLowerCase())
  const fieldScore = getFieldScore(ticker, title, symbols, needle)

  if (fieldScore) return fieldScore
  if (matchesDescription(asset.profile?.description, needle)) return 2
  if (isFuzzyMatch([ticker, title, ...toWords(title), ...symbols], needle)) return 1

  return 0
}

function hasMatchingToken(asset: RwaAsset, { issuers, chainIds }: RwaAssetsFilter): boolean {
  if (!issuers?.length && !chainIds?.length) return true

  return asset.tokens.some(
    (token) =>
      (!issuers?.length || issuers.includes(token.issuer)) && (!chainIds?.length || chainIds.includes(token.chainId)),
  )
}

function isAtLeast(value: number | null, min: number | undefined): boolean {
  return min === undefined || (value !== null && value >= min)
}

function isFuzzyMatch(candidates: string[], needle: string): boolean {
  if (needle.length < MIN_FUZZY_QUERY_LENGTH) return false

  const maxDistance = needle.length >= LONG_FUZZY_QUERY_LENGTH ? 2 : 1

  return candidates.some(
    (candidate) =>
      Math.abs(candidate.length - needle.length) <= maxDistance && getEditDistance(candidate, needle) <= maxDistance,
  )
}

/** Word-prefix match, so `goo` finds "…owns Google…" but `oogle` does not */
function matchesDescription(description: string | undefined, needle: string): boolean {
  if (!description || needle.length < MIN_DESCRIPTION_QUERY_LENGTH) return false

  const phrase = toWords(needle).join(' ')

  return Boolean(phrase) && ` ${toWords(description).join(' ')}`.includes(` ${phrase}`)
}

function toWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
}
