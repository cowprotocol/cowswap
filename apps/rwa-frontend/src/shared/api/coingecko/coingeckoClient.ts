import 'server-only'

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

interface CoingeckoConfig {
  baseUrl: string
  headers: Record<string, string>
}

interface OnchainOhlcvResponse {
  data?: { attributes: { ohlcv_list: CoingeckoOhlcvCandle[] } }
}

interface OnchainTokensResponse {
  data?: CoingeckoOnchainToken[]
  status?: { error_code: number; error_message: string }
}

const MARKETS_BATCH_SIZE = 250
const ONCHAIN_BATCH_SIZE = 30
const GECKOTERMINAL_BASE_URL = 'https://api.geckoterminal.com/api/v2'

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

export async function fetchCoinsMarkets(ids: string[], revalidateSeconds: number): Promise<CoingeckoMarket[]> {
  const batches = chunk([...ids].sort(), MARKETS_BATCH_SIZE)
  const results = await Promise.all(
    batches.map((batch) =>
      coingeckoFetch<CoingeckoMarket[]>(
        `/coins/markets?vs_currency=usd&per_page=${MARKETS_BATCH_SIZE}&ids=${batch.join(',')}`,
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
  return coingeckoFetch<CoingeckoMarketChart>(
    `/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`,
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

  const { baseUrl, headers } = getOnchainConfig()
  const response = await fetchJsonOrNotFound<OnchainOhlcvResponse>(
    `${baseUrl}/networks/${network}/tokens/${address}/ohlcv/${timeframe}?aggregate=1&limit=${limit}&currency=usd`,
    headers,
    revalidateSeconds,
  )

  return response?.data?.attributes.ohlcv_list ?? []
}

/** `null` when the onchain API doesn't index the network */
export async function fetchOnchainTokens(
  chainId: number,
  addresses: string[],
  revalidateSeconds: number,
): Promise<CoingeckoOnchainToken[] | null> {
  const network = ONCHAIN_NETWORKS[chainId]

  if (!network) return null

  const { baseUrl, headers } = getOnchainConfig()
  const batches = chunk([...addresses].sort(), ONCHAIN_BATCH_SIZE)
  const results = await Promise.all(
    batches.map((batch) =>
      fetchJson<OnchainTokensResponse>(
        `${baseUrl}/networks/${network}/tokens/multi/${batch.join(',')}`,
        headers,
        revalidateSeconds,
      ),
    ),
  )

  return results.flatMap(({ data, status }) => {
    // GeckoTerminal reports rate limiting with HTTP 200 and an error `status`
    if (!data) throw new Error(`GeckoTerminal responded with ${status?.error_code ?? 'no data'}`)

    return data
  })
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []

  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))

  return chunks
}

async function coingeckoFetch<T>(path: string, revalidate: number): Promise<T> {
  const { baseUrl, headers } = getConfig()

  return fetchJson<T>(`${baseUrl}${path}`, headers, revalidate)
}

async function fetchJson<T>(url: string, headers: Record<string, string>, revalidate: number): Promise<T> {
  return readJson<T>(url, await request(url, headers, revalidate))
}

/** `null` when the upstream answers 404 */
async function fetchJsonOrNotFound<T>(
  url: string,
  headers: Record<string, string>,
  revalidate: number,
): Promise<T | null> {
  const response = await request(url, headers, revalidate)

  return response.status === 404 ? null : readJson<T>(url, response)
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
function getOnchainConfig(): CoingeckoConfig {
  const config = getConfig()

  return process.env.COINGECKO_API_KEY
    ? { ...config, baseUrl: `${config.baseUrl}/onchain` }
    : { baseUrl: GECKOTERMINAL_BASE_URL, headers: {} }
}

function isProPlan(): boolean {
  return Boolean(process.env.COINGECKO_API_KEY) && process.env.COINGECKO_API_PLAN === 'pro'
}

function readJson<T>(url: string, response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`CoinGecko ${new URL(url).pathname} responded with ${response.status}`)
  }

  return response.json() as Promise<T>
}

function request(url: string, headers: Record<string, string>, revalidate: number): Promise<Response> {
  return fetch(url, { headers: { accept: 'application/json', ...headers }, next: { revalidate } })
}
