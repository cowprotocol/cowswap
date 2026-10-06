import 'server-only'

import { normalizeError } from '@cowprotocol/common-utils/errors'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { coingeckoProvider, type MarketDataProvider } from './marketData'
import { getTokenQuotes, QUOTE_AMOUNT_USD } from './quotes'

import { sumNullable } from '../lib/sumNullable'
import { countByType, filterAssets, paginate, searchAssets, sortAssets } from '../model/assetsQuery'
import {
  buildDailySeries,
  buildMarketCapSeries,
  latestUpdatedAt,
  rankMostTraded,
  splitMovers,
  toOverviewItem,
} from '../model/marketOverview'
import { getAssetByTicker, getAssets } from '../model/registry'

import type {
  RwaAggregateMarket,
  RwaAsset,
  RwaAssetListItem,
  RwaAssetQuotes,
  RwaAssetResponse,
  RwaAssetsFilter,
  RwaAssetsPage,
  RwaAssetsSearchResult,
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

import { logger } from '@/shared/lib/logger/index.server'

const marketDataProvider: MarketDataProvider = coingeckoProvider

const MARKET_OVERVIEW_LIST_LIMIT = 3

export interface ListAssetsParams extends RwaAssetsFilter {
  page: number
  pageSize: number
  sort: RwaSortField
  order: RwaSortOrder
}

interface ListedMarket {
  asset: RwaAsset
  market: RwaAggregateMarket
}

interface RwaMarketsLoadResult {
  /** Keyed by `RwaAsset.coingeckoId` */
  byId: Map<string, RwaAggregateMarket>
  degraded: boolean
}

export async function findAssets(query: string, limit: number): Promise<RwaAssetsSearchResult> {
  const { byId, degraded } = await loadRwaMarkets()
  const items = searchAssets(getAssets(), query)
    .slice(0, limit)
    .map((asset) => ({ ...asset, market: toMarketData(byId.get(asset.coingeckoId)) }))

  return { items, degraded }
}

export async function getAsset(ticker: string): Promise<RwaAssetResponse | null> {
  const asset = getAssetByTicker(ticker)

  if (!asset) return null

  const [{ byId, degraded }, tokenMarkets] = await Promise.all([loadRwaMarkets(), loadTokenMarkets(asset.tokens)])

  return {
    ...asset,
    market: toMarketData(byId.get(asset.coingeckoId), tokenMarkets ?? {}),
    degraded: degraded || tokenMarkets === null,
  }
}

export async function getAssetChart(asset: RwaAsset, range: RwaChartRange): Promise<RwaChartPoint[]> {
  return marketDataProvider.getChart(asset, range)
}

/** `chainId` must have tokens of the asset */
export async function getAssetNetworkStats(asset: RwaAsset, chainId: number): Promise<RwaNetworkStats> {
  const tokens = asset.tokens.filter((token) => token.chainId === chainId)
  const tokenMarkets = await loadTokenMarkets(asset.tokens)
  const stats = await loadNetworkStats(chainId, tokens, tokenMarkets ?? {})

  if (stats) return { ticker: asset.ticker, chainId, tokens: stats, degraded: tokenMarkets === null }

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
  const { byId, degraded } = await loadRwaMarkets()
  const listed = assets.flatMap((asset): ListedMarket[] => {
    const market = byId.get(asset.coingeckoId)

    return market ? [{ asset, market }] : []
  })
  const markets = listed.map(({ market }) => market)
  const items = listed.map(({ asset, market }) => toOverviewItem(asset, market))
  const marketsByTicker = new Map(listed.map(({ asset, market }) => [asset.ticker, market]))
  const withDailySeries = (moverItems: RwaMarketOverviewItem[]): RwaMarketOverviewItem[] =>
    moverItems.map((item) => ({ ...item, series: getDailySeries(marketsByTicker.get(item.ticker)) }))
  const { gainers, losers } = splitMovers(items, MARKET_OVERVIEW_LIST_LIMIT)
  const mostTraded = await withSeries(rankMostTraded(items, MARKET_OVERVIEW_LIST_LIMIT), (asset) =>
    marketDataProvider.getHourlyDexVolume(asset.tokens),
  )

  return {
    totals: {
      marketCap: sumNullable(markets.map(({ marketCap }) => marketCap)),
      volume24h: sumNullable(markets.map(({ volume24h }) => volume24h)),
      marketCapSeries: buildMarketCapSeries(markets),
    },
    mostTraded,
    gainers: withDailySeries(gainers),
    losers: withDailySeries(losers),
    updatedAt: latestUpdatedAt(markets),
    tradingTime: assets.find((asset) => asset.allowedTradingTime)?.allowedTradingTime ?? null,
    degraded,
  }
}

export async function listAssets({ page, pageSize, sort, order, ...filter }: ListAssetsParams): Promise<RwaAssetsPage> {
  const registry = getAssets()
  const { byId, degraded } = await loadRwaMarkets()
  const matches = filterAssets(registry, filter).map((asset): RwaAssetListItem => {
    return { ...asset, market: toMarketData(byId.get(asset.coingeckoId)), series: null }
  })
  const sorted = sortAssets(matches, sort, order)
  const { items, totalPages } = paginate(sorted, page, pageSize)

  return {
    items: items.map((item) => ({ ...item, series: getDailySeries(byId.get(item.coingeckoId)) })),
    page,
    pageSize,
    total: sorted.length,
    totalPages,
    typeCounts: countByType(registry, filter),
    issuers: [...new Set(registry.flatMap((asset) => asset.tokens.map((token) => token.issuer)))].sort(),
    chainIds: [...new Set(registry.flatMap((asset) => asset.tokens.map((token) => token.chainId)))].sort(
      (a, b) => a - b,
    ),
    degraded,
  }
}

function getDailySeries(market: RwaAggregateMarket | undefined): RwaChartPoint[] | null {
  return market ? buildDailySeries(market) : null
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
    logger.error({ err: error, chainId }, 'Failed to load network stats')

    return null
  }
}

// Always requested in full, so every route hits the same cached upstream requests
async function loadRwaMarkets(): Promise<RwaMarketsLoadResult> {
  try {
    return { byId: await marketDataProvider.getRwaMarkets(getAssets().length), degraded: false }
  } catch (err: unknown) {
    const error = normalizeError(err)
    logger.error({ err: error }, 'Failed to load RWA markets')

    return { byId: new Map(), degraded: true }
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
    logger.error({ err: error, ticker }, 'Failed to load series')

    return null
  }
}

/** `null` when the provider failed */
async function loadTokenMarkets(tokens: RwaToken[]): Promise<Record<string, RwaTokenMarketData> | null> {
  try {
    return await marketDataProvider.getTokenMarkets(tokens)
  } catch (err: unknown) {
    const error = normalizeError(err)
    logger.error({ err: error }, 'Failed to load token markets')

    return null
  }
}

function toMarketData(
  market: RwaAggregateMarket | undefined,
  tokens: Record<string, RwaTokenMarketData> = {},
): RwaMarketData | null {
  if (!market) return null

  return {
    price: market.price,
    change24h: market.change24h,
    dayLow: market.dayLow,
    dayHigh: market.dayHigh,
    marketCap: market.marketCap,
    volume24h: market.volume24h,
    updatedAt: market.updatedAt,
    tokens,
  }
}

async function withSeries(
  items: RwaMarketOverviewItem[],
  load: (asset: RwaAsset) => Promise<RwaChartPoint[] | null>,
): Promise<RwaMarketOverviewItem[]> {
  return Promise.all(items.map(async (item) => ({ ...item, series: await loadSeries(item.ticker, load) })))
}
