import 'server-only'

import { unstable_cache } from 'next/cache'

import { withRetryBackoff } from '../coingecko/retryBackoff'

interface MultiplierHistoryResponse {
  nodes: { activationDateTime: string }[]
}

interface MultiplierResponse {
  /** `0` when no multiplier is pending */
  newMultiplier: number
  /** `0` when no multiplier is pending, otherwise ISO 8601 */
  activationDateTime: number | string
}

const BASE_URL = 'https://api.xstocks.fi/api/v2/public'
const REQUEST_TIMEOUT_MS = 10_000
const MULTIPLIER_REVALIDATE_SECONDS = 300
/** Bump when the cached value changes shape: the data cache outlives deployments */
const MULTIPLIER_CACHE_KEY = ['xstocks-multiplier-activation', 'v1']

/** xStocks network names */
const NETWORKS: Partial<Record<number, string>> = {
  1: 'Ethereum',
  10: 'Optimism',
  56: 'BinanceSmartChain',
  100: 'Gnosis',
  137: 'Polygon',
  8453: 'Base',
  42161: 'Arbitrum',
  43114: 'Avalanche',
  57073: 'Ink',
}

/**
 * Unix ms when the pending multiplier of `symbol` (the xStocks one, e.g. `NVDAx`) activates on every network, or when
 * the last one activated if none is pending. `null` when the asset is unknown, has no multiplier history or `chainId`
 * isn't an xStocks network
 */
export async function fetchXStocksActivation(symbol: string, chainId: number): Promise<number | null> {
  const network = NETWORKS[chainId]

  return network ? loadActivation(symbol, network) : null
}

const loadActivation = unstable_cache(
  (symbol: string, network: string): Promise<number | null> =>
    withRetryBackoff(`xstocks ${symbol} multiplier`, async () => {
      const pending = await requestPendingActivation(symbol, network)

      return pending ?? requestLastActivation(symbol, network)
    }),
  MULTIPLIER_CACHE_KEY,
  { revalidate: MULTIPLIER_REVALIDATE_SECONDS },
)

/** `null` on 404 */
async function request<T>(symbol: string, path: string, network: string): Promise<T | null> {
  const params = new URLSearchParams({ network })
  const response = await fetch(`${BASE_URL}/assets/${encodeURIComponent(symbol)}/${path}?${params}`, {
    headers: { accept: 'application/json' },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (response.status === 404) return null
  if (!response.ok) throw new Error(`xStocks ${symbol} ${path} responded with ${response.status}`)

  return (await response.json()) as T
}

async function requestLastActivation(symbol: string, network: string): Promise<number | null> {
  const response = await request<MultiplierHistoryResponse>(symbol, 'multiplier/history', network)
  const activations = (response?.nodes ?? [])
    .map(({ activationDateTime }) => Date.parse(activationDateTime))
    .filter(Number.isFinite)

  return activations.length ? Math.max(...activations) : null
}

async function requestPendingActivation(symbol: string, network: string): Promise<number | null> {
  const response = await request<MultiplierResponse>(symbol, 'multiplier', network)

  if (!response) return null

  const { newMultiplier, activationDateTime } = response
  const activatesAt = typeof activationDateTime === 'string' ? Date.parse(activationDateTime) : NaN

  return newMultiplier > 0 && Number.isFinite(activatesAt) ? activatesAt : null
}
