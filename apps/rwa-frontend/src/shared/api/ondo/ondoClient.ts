import 'server-only'

import { unstable_cache } from 'next/cache'

import { withRetryBackoff } from '../coingecko/retryBackoff'

interface OndoMarket {
  primaryMarket: { symbol: string; sharesMultiplier?: string }
}

const BASE_URL = 'https://api.gm.ondo.finance'
const REQUEST_TIMEOUT_MS = 10_000
/** Ondo caches market data for a minute, and multipliers change only on corporate actions */
const MULTIPLIERS_REVALIDATE_SECONDS = 300
/** Bump when the cached multipliers change shape: the data cache outlives deployments */
const MULTIPLIERS_CACHE_KEY = ['ondo-shares-multipliers', 'v1']

/**
 * Shares of the underlying one token stands for, keyed by upper-case token symbol (e.g. `NVDAON`).
 * `null` without `ONDO_API_KEY`
 */
export async function fetchOndoSharesMultipliers(): Promise<Record<string, number> | null> {
  return process.env.ONDO_API_KEY ? loadSharesMultipliers() : null
}

// The full response is ~3 MB, over the 2 MB data cache entry limit, so only the multipliers are cached
const loadSharesMultipliers = unstable_cache(
  (): Promise<Record<string, number>> =>
    withRetryBackoff('ondo /v1/assets/all/market', async () => toSharesMultipliers(await requestAllMarkets())),
  MULTIPLIERS_CACHE_KEY,
  { revalidate: MULTIPLIERS_REVALIDATE_SECONDS },
)

async function requestAllMarkets(): Promise<OndoMarket[]> {
  const response = await fetch(`${BASE_URL}/v1/assets/all/market`, {
    headers: { accept: 'application/json', 'x-api-key': process.env.ONDO_API_KEY ?? '' },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) throw new Error(`Ondo /v1/assets/all/market responded with ${response.status}`)

  return (await response.json()) as OndoMarket[]
}

function toSharesMultipliers(markets: OndoMarket[]): Record<string, number> {
  return Object.fromEntries(
    markets.flatMap(({ primaryMarket: { symbol, sharesMultiplier } }) => {
      const multiplier = Number(sharesMultiplier)

      return Number.isFinite(multiplier) && multiplier > 0 ? [[symbol.toUpperCase(), multiplier] as const] : []
    }),
  )
}
