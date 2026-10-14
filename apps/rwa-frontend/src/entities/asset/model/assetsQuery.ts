import type { RwaAsset, RwaAssetWithMarket, RwaSortField, RwaSortOrder } from './types'

type SortValueGetter = (asset: RwaAssetWithMarket) => number | string | null

const SORT_VALUE_GETTERS: Record<RwaSortField, SortValueGetter> = {
  priority: (asset) => asset.priority,
  marketCap: (asset) => asset.market?.marketCap ?? null,
  change24h: (asset) => asset.market?.change24h ?? null,
  price: (asset) => asset.market?.price ?? null,
  ticker: (asset) => asset.ticker,
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

export function sortAssets(
  assets: RwaAssetWithMarket[],
  sort: RwaSortField,
  order: RwaSortOrder,
): RwaAssetWithMarket[] {
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
  if (typeof a === 'string' || typeof b === 'string') return String(a).localeCompare(String(b))

  return a - b
}

function getSearchScore(asset: RwaAsset, needle: string): number {
  const ticker = asset.ticker.toLowerCase()
  const title = asset.title.toLowerCase()
  const symbols = asset.tokens.map((token) => token.symbol.toLowerCase())

  if (ticker === needle) return 4
  if (ticker.startsWith(needle) || symbols.some((symbol) => symbol.startsWith(needle))) return 3
  if (title.startsWith(needle)) return 2
  if (ticker.includes(needle) || title.includes(needle) || symbols.some((symbol) => symbol.includes(needle))) return 1

  return 0
}
