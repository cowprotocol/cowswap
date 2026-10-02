import 'server-only'

import { normalizeError } from '@cowprotocol/common-utils/errors'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { coingeckoProvider, type MarketDataProvider } from './marketData'
import { getTokenQuotes, QUOTE_AMOUNT_USD } from './quotes'

import { paginate, searchAssets, sortAssets } from '../model/assetsQuery'
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
  RwaAssetQuotes,
  RwaAssetResponse,
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
  const tokenMarkets: Record<string, RwaTokenMarketData> = Object.fromEntries(
    [...marketByTicker.values()].flatMap((market) => Object.entries(market.tokens)),
  )
  const tokensByChain = groupByChain(assets.flatMap((asset) => asset.tokens))
  const statsResults = await Promise.all(
    [...tokensByChain].map(async ([chainId, tokens]): Promise<ChainNetworkStats | null> => {
      const stats = await loadNetworkStats(chainId, tokens, tokenMarkets)

      return stats ? { chainId, tokens: stats } : null
    }),
  )
  const stats = statsResults.filter((result): result is ChainNetworkStats => result !== null)
  const statsComplete = stats.length === statsResults.length
  const aggregate = aggregateNetworkStats(assets, stats, marketByTicker)
  const items = assets.map((asset) =>
    toOverviewItem(asset, marketByTicker.get(asset.ticker), aggregate.byTicker.get(asset.ticker)),
  )
  const { gainers, losers } = splitMovers(items, MARKET_OVERVIEW_LIST_LIMIT)
  const mostTraded = statsComplete ? rankMostTraded(items, MARKET_OVERVIEW_LIST_LIMIT) : []
  const loadPriceChart = (asset: RwaAsset): Promise<RwaChartPoint[]> => marketDataProvider.getChart(asset, '1D')

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

export async function listAssets({ page, pageSize, sort, order }: ListAssetsParams): Promise<RwaAssetsPage> {
  const { items: assets, degraded } = await withMarketData(getAssets())
  const sorted = sortAssets(assets, sort, order)
  const { items, totalPages } = paginate(sorted, page, pageSize)

  return { items, page, pageSize, total: sorted.length, totalPages, degraded }
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
    console.error(`[rwa] Failed to load the ${ticker} overview series`, error)

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
