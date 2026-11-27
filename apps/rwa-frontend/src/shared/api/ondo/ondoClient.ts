import 'server-only'

import { unstable_cache } from 'next/cache'

import { createCachedJsonFetcher } from '../cachedJson'
import { withRetryBackoff } from '../coingecko/retryBackoff'

/** Decimal strings, USD */
export interface OndoCandle {
  /** Unix ms of the candle open */
  timestamp: number
  open: string
  high: string
  low: string
  close: string
}

/** The only `interval/range` pairs Ondo accepts that the app uses */
export type OndoOhlcPeriod = '15min/1day' | '1hour/1month' | '4hour/1month' | '1day/1year' | '1day/all'

/** The underlying stock of an Ondo token. Decimal strings, USD */
export interface OndoUnderlyingMarket {
  ticker: string
  price: string
  priceHigh52w?: string
  priceLow52w?: string
  /** Shares traded over the last 24h */
  volume?: string
  marketCap?: string
}

export interface OndoUnderlyingSnapshot {
  underlyingMarket: OndoUnderlyingMarket
  /** Unix ms */
  timestamp: number
}

interface OndoMarket {
  primaryMarket: { symbol: string; sharesMultiplier?: string }
}

interface OndoOhlcResponse {
  underlyingMarket: { data: OndoCandle[] }
}

const BASE_URL = 'https://api.gm.ondo.finance'
const REQUEST_TIMEOUT_MS = 10_000
/** Ondo caches market data for a minute, and multipliers change only on corporate actions */
const MULTIPLIERS_REVALIDATE_SECONDS = 300
/** Bump when the cached multipliers change shape: the data cache outlives deployments */
const MULTIPLIERS_CACHE_KEY = ['ondo-shares-multipliers', 'v1']
/** Bump when a cached Ondo payload changes shape */
const RESPONSE_CACHE_KEY = ['ondo-response', 'v1']

const fetchCachedJson = createCachedJsonFetcher(RESPONSE_CACHE_KEY, (url, allowNotFound) =>
  withRetryBackoff(url, () => requestJson(url, allowNotFound)),
)

/**
 * Shares of the underlying one token stands for, keyed by upper-case token symbol (e.g. `NVDAON`).
 * `null` without `ONDO_API_KEY`
 */
export async function fetchOndoSharesMultipliers(): Promise<Record<string, number> | null> {
  return process.env.ONDO_API_KEY ? loadSharesMultipliers() : null
}

/**
 * Stock candles of the token `symbol` (e.g. `NVDAon`), oldest first.
 * `null` without `ONDO_API_KEY` or when Ondo doesn't list the token
 */
export async function fetchOndoUnderlyingCandles(
  symbol: string,
  period: OndoOhlcPeriod,
  revalidateSeconds: number,
): Promise<OndoCandle[] | null> {
  if (!process.env.ONDO_API_KEY) return null

  const [interval = '', range = ''] = period.split('/')
  const params = new URLSearchParams({ interval, range })
  const response = (await fetchCachedJson(
    `${BASE_URL}/v1/assets/${encodeURIComponent(symbol)}/prices/ohlc?${params}`,
    revalidateSeconds,
    true,
  )) as OndoOhlcResponse | null

  return response ? response.underlyingMarket.data : null
}

/** Stock market of the token `symbol` (e.g. `NVDAon`). `null` without `ONDO_API_KEY` or when Ondo doesn't list it */
export async function fetchOndoUnderlyingMarket(
  symbol: string,
  revalidateSeconds: number,
): Promise<OndoUnderlyingSnapshot | null> {
  if (!process.env.ONDO_API_KEY) return null

  const response = (await fetchCachedJson(
    `${BASE_URL}/v1/assets/${encodeURIComponent(symbol)}/market`,
    revalidateSeconds,
    true,
  )) as OndoUnderlyingSnapshot | null

  return response ? { underlyingMarket: response.underlyingMarket, timestamp: response.timestamp } : null
}

// The full response is ~3 MB, over the 2 MB data cache entry limit, so only the multipliers are cached
const loadSharesMultipliers = unstable_cache(
  (): Promise<Record<string, number>> =>
    withRetryBackoff('ondo /v1/assets/all/market', async () => toSharesMultipliers(await requestAllMarkets())),
  MULTIPLIERS_CACHE_KEY,
  { revalidate: MULTIPLIERS_REVALIDATE_SECONDS },
)

async function requestAllMarkets(): Promise<OndoMarket[]> {
  return (await requestJson(`${BASE_URL}/v1/assets/all/market`, false)) as OndoMarket[]
}

/** `null` when Ondo answers 404 and `allowNotFound` is set */
async function requestJson(url: string, allowNotFound: boolean): Promise<unknown> {
  const response = await fetch(url, {
    headers: { accept: 'application/json', 'x-api-key': process.env.ONDO_API_KEY ?? '' },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (allowNotFound && response.status === 404) return null
  if (!response.ok) throw new Error(`Ondo ${new URL(url).pathname} responded with ${response.status}`)

  return response.json()
}

function toSharesMultipliers(markets: OndoMarket[]): Record<string, number> {
  return Object.fromEntries(
    markets.flatMap(({ primaryMarket: { symbol, sharesMultiplier } }) => {
      const multiplier = Number(sharesMultiplier)

      return Number.isFinite(multiplier) && multiplier > 0 ? [[symbol.toUpperCase(), multiplier] as const] : []
    }),
  )
}
