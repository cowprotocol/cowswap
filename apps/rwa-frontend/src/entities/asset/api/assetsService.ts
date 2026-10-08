import 'server-only'

import { normalizeError } from '@cowprotocol/common-utils/errors'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { coingeckoProvider, type MarketDataProvider } from './marketData'
import { getTokenQuotes, QUOTE_AMOUNT_USD } from './quotes'

import { getReferenceLogoUrl } from '../lib/referenceLogoUrl'
import { countByType, filterAssets, paginate, searchAssets, sortAssets } from '../model/assetsQuery'
import {
  aggregateNetworkStats,
  buildOnchainCapSeries,
  type ChainNetworkStats,
  latestUpdatedAt,
  rankMostTraded,
  splitMovers,
  toOverviewItem,
} from '../model/marketOverview'
import { getAssetByTicker, getAssets } from '../model/registry'

import type {
  RwaAsset,
  RwaAssetListItem,
  RwaAssetQuotes,
  RwaAssetResponse,
  RwaAssetsFilter,
  RwaAssetsPage,
  RwaAssetsSearchResult,
  RwaAssetWithMarket,
  RwaChartPoint,
  RwaChartRange,
  RwaMarketData,
  RwaMarketOverview,
  RwaMarketOverviewItem,
  RwaNetworkStats,
  RwaQuoteSide,
  RwaSortField,
  RwaSortOrder,
  RwaToken,
  RwaTokenMarketData,
  RwaTokenNetworkStats,
} from '../model/types'

const marketDataProvider: MarketDataProvider = coingeckoProvider

const MARKET_OVERVIEW_LIST_LIMIT = 3

export interface ListAssetsParams extends RwaAssetsFilter {
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

interface NetworkStatsLoadResult {
  stats: ChainNetworkStats[]
  /** `false` when a network failed, so sums over the networks would be too low */
  complete: boolean
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
  const stats = await loadNetworkStats(chainId, tokens, byTicker.get(asset.ticker)?.tokens ?? {})

  if (stats) return { ticker: asset.ticker, chainId, tokens: stats, degraded }

  const empty = tokens.map(({ address }) => ({ address, onchainCap: null, dexVolume24h: null }))

  return { ticker: asset.ticker, chainId, tokens: empty, degraded: true }
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

export async function getMarketOverview(): Promise<RwaMarketOverview> {
  const assets = getAssets()
  const { byTicker: marketByTicker, degraded: marketDegraded } = await loadMarketData()
  const { stats, complete: statsComplete } = await loadRegistryNetworkStats(marketByTicker)
  const aggregate = aggregateNetworkStats(assets, stats, marketByTicker)
  const items = assets.map((asset) =>
    toOverviewItem(asset, marketByTicker.get(asset.ticker), aggregate.byTicker.get(asset.ticker)),
  )
  const { gainers, losers } = splitMovers(items, MARKET_OVERVIEW_LIST_LIMIT)
  const mostTraded = statsComplete ? rankMostTraded(items, MARKET_OVERVIEW_LIST_LIMIT) : []
  const [mostTradedWithSeries, gainersWithSeries, losersWithSeries, onchainCapSeries] = await Promise.all([
    withSeries(mostTraded, (asset) => marketDataProvider.getHourlyDexVolume(asset.tokens)),
    withSeries(gainers, loadPriceChart),
    withSeries(losers, loadPriceChart),
    statsComplete ? loadOnchainCapSeries(aggregate.supplyByCoin) : null,
  ])

  return {
    totals: {
      onchainCap: statsComplete ? aggregate.onchainCap : null,
      dexVolume24h: statsComplete ? aggregate.dexVolume24h : null,
      onchainCapSeries,
    },
    mostTraded: mostTradedWithSeries,
    gainers: gainersWithSeries,
    losers: losersWithSeries,
    updatedAt: latestUpdatedAt([...marketByTicker.values()]),
    tradingTime: assets.find((asset) => asset.allowedTradingTime)?.allowedTradingTime ?? null,
    degraded: marketDegraded || !statsComplete,
  }
}

export async function listAssets({ page, pageSize, sort, order, ...filter }: ListAssetsParams): Promise<RwaAssetsPage> {
  const registry = getAssets()
  const { byTicker: marketByTicker, degraded: marketDegraded } = await loadMarketData()
  const { stats, complete: statsComplete } = await loadRegistryNetworkStats(marketByTicker)
  const totalsByTicker = statsComplete ? aggregateNetworkStats(registry, stats, marketByTicker).byTicker : null
  const matches = filterAssets(registry, filter).map((asset): RwaAssetListItem => {
    const market = marketByTicker.get(asset.ticker) ?? null
    const totals = totalsByTicker?.get(asset.ticker)

    return {
      ...asset,
      market,
      logoUrl: getReferenceLogoUrl(asset, market),
      onchainCap: totals?.onchainCap ?? null,
      dexVolume24h: totals?.dexVolume24h ?? null,
      series: null,
    }
  })
  const sorted = sortAssets(matches, sort, order)
  const { items, totalPages } = paginate(sorted, page, pageSize)
  const itemsWithSeries = await Promise.all(
    items.map(async (item) => ({ ...item, series: await loadSeries(item.ticker, loadPriceChart) })),
  )

  return {
    items: itemsWithSeries,
    page,
    pageSize,
    total: sorted.length,
    totalPages,
    typeCounts: countByType(registry, filter),
    issuers: [...new Set(registry.flatMap((asset) => asset.tokens.map((token) => token.issuer)))].sort(),
    chainIds: [...new Set(registry.flatMap((asset) => asset.tokens.map((token) => token.chainId)))].sort(
      (a, b) => a - b,
    ),
    degraded: marketDegraded || !statsComplete,
  }
}

function groupByChain(tokens: RwaToken[]): Map<number, RwaToken[]> {
  const byChain = new Map<number, RwaToken[]>()

  for (const token of tokens) byChain.set(token.chainId, [...(byChain.get(token.chainId) ?? []), token])

  return byChain
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

async function loadNetworkStats(
  chainId: number,
  tokens: RwaToken[],
  tokenMarkets: Record<string, RwaTokenMarketData>,
): Promise<RwaTokenNetworkStats[] | null> {
  try {
    return await marketDataProvider.getNetworkStats(chainId, tokens, tokenMarkets)
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error('[rwa] Failed to load network stats', error)

    return null
  }
}

async function loadOnchainCapSeries(supplyByCoin: Map<string, number>): Promise<RwaChartPoint[] | null> {
  try {
    const histories = await marketDataProvider.getPriceHistory([...supplyByCoin.keys()], '7')

    return buildOnchainCapSeries(supplyByCoin, histories)
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error('[rwa] Failed to load the onchain cap history', error)

    return null
  }
}

function loadPriceChart(asset: RwaAsset): Promise<RwaChartPoint[]> {
  return marketDataProvider.getChart(asset, '1D')
}

// Always requested for the whole registry, so every route hits the same cached upstream requests
async function loadRegistryNetworkStats(marketByTicker: Map<string, RwaMarketData>): Promise<NetworkStatsLoadResult> {
  const tokenMarkets: Record<string, RwaTokenMarketData> = Object.fromEntries(
    [...marketByTicker.values()].flatMap((market) => Object.entries(market.tokens)),
  )
  const tokensByChain = groupByChain(getAssets().flatMap((asset) => asset.tokens))
  const results = await Promise.all(
    [...tokensByChain].map(async ([chainId, tokens]): Promise<ChainNetworkStats | null> => {
      const stats = await loadNetworkStats(chainId, tokens, tokenMarkets)

      return stats ? { chainId, tokens: stats } : null
    }),
  )
  const stats = results.filter((result): result is ChainNetworkStats => result !== null)

  return { stats, complete: stats.length === results.length }
}

async function loadSeries(
  ticker: string,
  load: (asset: RwaAsset) => Promise<RwaChartPoint[] | null>,
): Promise<RwaChartPoint[] | null> {
  const asset = getAssetByTicker(ticker)

  if (!asset) return null

  try {
    const series = await load(asset)

    return series?.length ? series : null
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error(`[rwa] Failed to load the ${ticker} series`, error)

    return null
  }
}

async function withMarketData(assets: RwaAsset[]): Promise<AssetsWithMarket> {
  const { byTicker, degraded } = await loadMarketData()

  return { items: assets.map((asset) => ({ ...asset, market: byTicker.get(asset.ticker) ?? null })), degraded }
}

async function withSeries(
  items: RwaMarketOverviewItem[],
  load: (asset: RwaAsset) => Promise<RwaChartPoint[] | null>,
): Promise<RwaMarketOverviewItem[]> {
  return Promise.all(items.map(async (item) => ({ ...item, series: await loadSeries(item.ticker, load) })))
}
