import 'server-only'

import { unstable_cache } from 'next/cache'

import { withRetryBackoff } from './retryBackoff'

/** `days` param of `/coins/{id}/market_chart` */
export type CoingeckoChartDays = '1' | '7' | '30' | '365' | 'max'

export interface CoingeckoMarket {
  id: string
  current_price: number | null
  market_cap: number | null
  total_volume: number | null
  image: string | null
  high_24h: number | null
  low_24h: number | null
  price_change_percentage_24h: number | null
  last_updated: string | null
}

export interface CoingeckoMarketChart {
  /** `[timestamp ms, price USD]` */
  prices: [number, number][]
}

/** `[timestamp s, open, high, low, close, volume]`, USD */
export type CoingeckoOhlcvCandle = [number, number, number, number, number, number]

export type CoingeckoOhlcvTimeframe = 'day' | 'hour' | 'minute'

/** A token on one network, from the onchain (GeckoTerminal) API */
export interface CoingeckoOnchainToken {
  attributes: {
    address: string
    /** Decimal string, in token units */
    normalized_total_supply: string | null
    /** USD, decimal strings */
    volume_usd: { h24: string | null }
  }
}

export interface CoingeckoRwaMarket {
  id: string
  /** USD */
  tokenized_market_data: {
    current_price: number | null
    market_cap: number | null
    total_volume: number | null
    high_24h: number | null
    low_24h: number | null
    price_change_percentage_24h: number | null
    last_updated: string | null
    /** Hourly, oldest first */
    sparkline_in_7d?: { price: number[] }
  } | null
}

interface CoingeckoConfig {
  baseUrl: string
  headers: Record<string, string>
}

interface OnchainOhlcvResponse {
  data?: { attributes: { ohlcv_list: CoingeckoOhlcvCandle[] } }
}

interface OnchainTokensResponse {
  data?: CoingeckoOnchainToken[]
}

interface UpstreamErrorBody {
  status: { error_code: number }
}

const MARKETS_BATCH_SIZE = 250
const ONCHAIN_BATCH_SIZE = 30
const RWA_MARKETS_PAGE_SIZE = 250
const GECKOTERMINAL_BASE_URL = 'https://api.geckoterminal.com/api/v2'
/** Bump when a cached upstream payload changes shape: the data cache outlives deployments */
const RESPONSE_CACHE_KEY = ['coingecko-response', 'v1']

/** GeckoTerminal network ids */
const ONCHAIN_NETWORKS: Partial<Record<number, string>> = {
  1: 'eth',
  56: 'bsc',
  100: 'xdai',
  137: 'polygon_pos',
  8453: 'base',
  42161: 'arbitrum',
  43114: 'avax',
  59144: 'linea',
}

/**
 * Requests the batches of `batchIds` that hold any of `ids`, so callers passing the same `batchIds` share batch URLs.
 * The result has every coin of those batches
 */
export async function fetchCoinsMarkets(
  ids: string[],
  revalidateSeconds: number,
  batchIds: string[] = ids,
): Promise<CoingeckoMarket[]> {
  const { baseUrl } = getConfig()
  const results = await Promise.all(
    getBatchesOf(ids, batchIds, MARKETS_BATCH_SIZE).map((batch) =>
      fetchJson<CoingeckoMarket[]>(
        `${baseUrl}/coins/markets?vs_currency=usd&per_page=${MARKETS_BATCH_SIZE}&ids=${batch.join(',')}`,
        revalidateSeconds,
      ),
    ),
  )

  return results.flat()
}

export async function fetchMarketChart(
  id: string,
  days: CoingeckoChartDays,
  revalidateSeconds: number,
): Promise<CoingeckoMarketChart> {
  return fetchJson<CoingeckoMarketChart>(
    `${getConfig().baseUrl}/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`,
    revalidateSeconds,
  )
}

/**
 * Candles of the token's most liquid pool, Pro plan only.
 * `null` without the Pro plan or when the onchain API doesn't index the network, empty for a token without pools.
 */
export async function fetchOnchainTokenOhlcv(
  chainId: number,
  address: string,
  timeframe: CoingeckoOhlcvTimeframe,
  limit: number,
  revalidateSeconds: number,
): Promise<CoingeckoOhlcvCandle[] | null> {
  const network = ONCHAIN_NETWORKS[chainId]

  if (!network || !isProPlan()) return null

  const response = await fetchJsonOrNotFound<OnchainOhlcvResponse>(
    `${getOnchainBaseUrl()}/networks/${network}/tokens/${address}/ohlcv/${timeframe}?aggregate=1&limit=${limit}&currency=usd`,
    revalidateSeconds,
  )

  return response?.data?.attributes.ohlcv_list ?? []
}

/**
 * Requests the batches of `batchAddresses` that hold any of `addresses`, like `fetchCoinsMarkets`.
 * `null` when the onchain API doesn't index the network
 */
export async function fetchOnchainTokens(
  chainId: number,
  addresses: string[],
  revalidateSeconds: number,
  batchAddresses: string[] = addresses,
): Promise<CoingeckoOnchainToken[] | null> {
  const network = ONCHAIN_NETWORKS[chainId]

  if (!network) return null

  const baseUrl = getOnchainBaseUrl()
  const results = await Promise.all(
    getBatchesOf(addresses, batchAddresses, ONCHAIN_BATCH_SIZE).map((batch) =>
      fetchJson<OnchainTokensResponse>(
        `${baseUrl}/networks/${network}/tokens/multi/${batch.join(',')}`,
        revalidateSeconds,
      ),
    ),
  )

  return results.flatMap(({ data }) => {
    if (!data) throw new Error('GeckoTerminal responded with no data')

    return data
  })
}

/**
 * Requests the pages that `expectedCount` markets fill concurrently, then the next ones until a short page.
 * Uncached and without retry backoff: the data cache would keep each page from a different moment,
 * so the caller caches the whole list
 */
export async function fetchRwaMarkets(expectedCount: number): Promise<CoingeckoRwaMarket[]> {
  const expectedPages = Math.max(1, Math.ceil(expectedCount / RWA_MARKETS_PAGE_SIZE))
  const pages = await Promise.all(Array.from({ length: expectedPages }, (_, index) => fetchRwaMarketsPage(index + 1)))

  for (let page = expectedPages + 1; (pages[pages.length - 1]?.length ?? 0) === RWA_MARKETS_PAGE_SIZE; page++) {
    pages.push(await fetchRwaMarketsPage(page))
  }

  return pages.flat()
}

class UpstreamError extends Error {
  constructor(url: string, status: number) {
    super(`CoinGecko ${new URL(url).pathname} responded with ${status}`)
    this.name = 'UpstreamError'
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []

  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))

  return chunks
}

const cachedRequests = new Map<number, (url: string) => Promise<unknown>>()

/**
 * Data cache entry per URL. A failed refresh keeps serving the stale entry
 * and `withRetryBackoff` spaces out the next upstream attempts.
 * `null` when the upstream answers 404
 */
function fetchCachedJson(url: string, revalidate: number): Promise<unknown> {
  let load = cachedRequests.get(revalidate)

  if (!load) {
    load = unstable_cache(
      (cacheUrl: string) => withRetryBackoff(cacheUrl, () => requestJson(cacheUrl)),
      RESPONSE_CACHE_KEY,
      { revalidate },
    )
    cachedRequests.set(revalidate, load)
  }

  return load(url)
}

async function fetchJson<T>(url: string, revalidate: number): Promise<T> {
  const body = await fetchCachedJson(url, revalidate)

  if (body === null) throw new UpstreamError(url, 404)

  return body as T
}

async function fetchJsonOrNotFound<T>(url: string, revalidate: number): Promise<T | null> {
  return (await fetchCachedJson(url, revalidate)) as T | null
}

async function fetchRwaMarketsPage(page: number): Promise<CoingeckoRwaMarket[]> {
  const url = `${getConfig().baseUrl}/rwas/markets?per_page=${RWA_MARKETS_PAGE_SIZE}&page=${page}&sparkline=true`
  const body = await requestJson(url)

  if (body === null) throw new UpstreamError(url, 404)

  return body as CoingeckoRwaMarket[]
}

/** Sorted batches of `batchItems` (plus `items` missing from it) that hold any of `items` */
function getBatchesOf(items: string[], batchItems: string[], size: number): string[][] {
  const wanted = new Set(items)
  const batches = chunk([...new Set([...batchItems, ...items])].sort(), size)

  return batches.filter((batch) => batch.some((item) => wanted.has(item)))
}

function getConfig(): CoingeckoConfig {
  const apiKey = process.env.COINGECKO_API_KEY

  if (!apiKey) return { baseUrl: 'https://api.coingecko.com/api/v3', headers: {} }

  if (isProPlan()) {
    return { baseUrl: 'https://pro-api.coingecko.com/api/v3', headers: { 'x-cg-pro-api-key': apiKey } }
  }

  return { baseUrl: 'https://api.coingecko.com/api/v3', headers: { 'x-cg-demo-api-key': apiKey } }
}

/** The keyless public API has no onchain endpoints, GeckoTerminal serves the same data for free */
function getOnchainBaseUrl(): string {
  return process.env.COINGECKO_API_KEY ? `${getConfig().baseUrl}/onchain` : GECKOTERMINAL_BASE_URL
}

function isProPlan(): boolean {
  return Boolean(process.env.COINGECKO_API_KEY) && process.env.COINGECKO_API_PLAN === 'pro'
}

function isUpstreamErrorBody(body: unknown): body is UpstreamErrorBody {
  if (typeof body !== 'object' || body === null || !('status' in body)) return false

  const { status } = body

  return typeof status === 'object' && status !== null && 'error_code' in status
}

/** `null` when the upstream answers 404 */
async function requestJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { accept: 'application/json', ...getConfig().headers },
    next: { revalidate: 0 },
  })

  if (response.status === 404) return null
  if (!response.ok) throw new UpstreamError(url, response.status)

  const body: unknown = await response.json()

  // GeckoTerminal and CoinGecko report rate limiting with HTTP 200 and an error `status`
  if (isUpstreamErrorBody(body)) throw new UpstreamError(url, body.status.error_code)

  return body
}
