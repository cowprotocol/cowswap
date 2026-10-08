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
  const response = await fetch(url, {
    headers: { accept: 'application/json', ...headers },
    next: { revalidate },
  })

  if (!response.ok) {
    throw new Error(`CoinGecko ${new URL(url).pathname} responded with ${response.status}`)
  }

  return response.json() as Promise<T>
}

function getConfig(): CoingeckoConfig {
  const apiKey = process.env.COINGECKO_API_KEY

  if (!apiKey) return { baseUrl: 'https://api.coingecko.com/api/v3', headers: {} }

  if (process.env.COINGECKO_API_PLAN === 'pro') {
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
