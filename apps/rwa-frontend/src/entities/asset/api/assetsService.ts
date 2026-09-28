import { normalizeError } from '@cowprotocol/common-utils/errors'

import { coingeckoProvider, type MarketDataProvider } from './marketData'

import { paginate, searchAssets, sortAssets } from '../model/assetsQuery'
import { getAssetByTicker, getAssets } from '../model/registry'

import type {
  RwaAsset,
  RwaAssetsPage,
  RwaAssetWithMarket,
  RwaChartPoint,
  RwaChartRange,
  RwaMarketData,
  RwaSortField,
  RwaSortOrder,
} from '../model/types'

const marketDataProvider: MarketDataProvider = coingeckoProvider

export interface ListAssetsParams {
  page: number
  pageSize: number
  sort: RwaSortField
  order: RwaSortOrder
}

export async function findAssets(query: string, limit: number): Promise<RwaAssetWithMarket[]> {
  return withMarketData(searchAssets(getAssets(), query).slice(0, limit))
}

export async function getAsset(ticker: string): Promise<RwaAssetWithMarket | null> {
  const asset = getAssetByTicker(ticker)

  if (!asset) return null

  const [withMarket] = await withMarketData([asset])

  return withMarket
}

export async function getAssetChart(asset: RwaAsset, range: RwaChartRange): Promise<RwaChartPoint[]> {
  return marketDataProvider.getChart(asset, range)
}

export async function listAssets({ page, pageSize, sort, order }: ListAssetsParams): Promise<RwaAssetsPage> {
  const assets = await withMarketData(getAssets())
  const sorted = sortAssets(assets, sort, order)
  const { items, totalPages } = paginate(sorted, page, pageSize)

  return { items, page, pageSize, total: sorted.length, totalPages }
}

// Always requested for the whole registry, so every route hits the same cached upstream request
async function loadMarketData(): Promise<Map<string, RwaMarketData>> {
  try {
    return await marketDataProvider.getMarketData(getAssets())
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error('[rwa] Failed to load market data', error)

    return new Map()
  }
}

async function withMarketData(assets: RwaAsset[]): Promise<RwaAssetWithMarket[]> {
  const marketData = await loadMarketData()

  return assets.map((asset) => ({ ...asset, market: marketData.get(asset.ticker) ?? null }))
}
