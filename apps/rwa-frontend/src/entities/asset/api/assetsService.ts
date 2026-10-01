import 'server-only'

import { normalizeError } from '@cowprotocol/common-utils/errors'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { coingeckoProvider, type MarketDataProvider } from './marketData'
import { getTokenQuotes, QUOTE_AMOUNT_USD } from './quotes'

import { paginate, searchAssets, sortAssets } from '../model/assetsQuery'
import { getAssetByTicker, getAssets } from '../model/registry'

import type {
  RwaAsset,
  RwaAssetQuotes,
  RwaAssetResponse,
  RwaAssetsPage,
  RwaAssetsSearchResult,
  RwaAssetWithMarket,
  RwaChartPoint,
  RwaChartRange,
  RwaMarketData,
  RwaNetworkStats,
  RwaQuoteSide,
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

interface AssetsWithMarket {
  items: RwaAssetWithMarket[]
  degraded: boolean
}

interface MarketDataLoadResult {
  byTicker: Map<string, RwaMarketData>
  degraded: boolean
}

export async function findAssets(query: string, limit: number): Promise<RwaAssetsSearchResult> {
  return withMarketData(searchAssets(getAssets(), query).slice(0, limit))
}

export async function getAsset(ticker: string): Promise<RwaAssetResponse | null> {
  const asset = getAssetByTicker(ticker)

  if (!asset) return null

  const {
    items: [withMarket],
    degraded,
  } = await withMarketData([asset])

  return { ...withMarket, degraded }
}

export async function getAssetChart(asset: RwaAsset, range: RwaChartRange): Promise<RwaChartPoint[]> {
  return marketDataProvider.getChart(asset, range)
}

/** `chainId` must have tokens of the asset */
export async function getAssetNetworkStats(asset: RwaAsset, chainId: number): Promise<RwaNetworkStats> {
  const tokens = asset.tokens.filter((token) => token.chainId === chainId)
  const { byTicker, degraded } = await loadMarketData()

  try {
    const stats = await marketDataProvider.getNetworkStats(chainId, tokens, byTicker.get(asset.ticker) ?? null)

    return { ticker: asset.ticker, chainId, tokens: stats, degraded }
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error('[rwa] Failed to load network stats', error)

    const empty = tokens.map(({ address }) => ({ address, onchainCap: null, dexVolume24h: null }))

    return { ticker: asset.ticker, chainId, tokens: empty, degraded: true }
  }
}

/** `chainId` must have tokens of the asset */
export async function getAssetQuotes(
  asset: RwaAsset,
  chainId: SupportedChainId,
  side: RwaQuoteSide,
): Promise<RwaAssetQuotes> {
  const addresses = asset.tokens.filter((token) => token.chainId === chainId).map((token) => token.address)
  const { quotes, degraded } = await getTokenQuotes(chainId, side, addresses)

  return { ticker: asset.ticker, chainId, side, amountUsd: QUOTE_AMOUNT_USD, quotes, degraded }
}

export async function listAssets({ page, pageSize, sort, order }: ListAssetsParams): Promise<RwaAssetsPage> {
  const { items: assets, degraded } = await withMarketData(getAssets())
  const sorted = sortAssets(assets, sort, order)
  const { items, totalPages } = paginate(sorted, page, pageSize)

  return { items, page, pageSize, total: sorted.length, totalPages, degraded }
}

// Always requested for the whole registry, so every route hits the same cached upstream request
async function loadMarketData(): Promise<MarketDataLoadResult> {
  try {
    return { byTicker: await marketDataProvider.getMarketData(getAssets()), degraded: false }
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error('[rwa] Failed to load market data', error)

    return { byTicker: new Map(), degraded: true }
  }
}

async function withMarketData(assets: RwaAsset[]): Promise<AssetsWithMarket> {
  const { byTicker, degraded } = await loadMarketData()

  return { items: assets.map((asset) => ({ ...asset, market: byTicker.get(asset.ticker) ?? null })), degraded }
}
