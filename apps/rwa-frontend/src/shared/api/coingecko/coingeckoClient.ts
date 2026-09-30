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

interface CoingeckoConfig {
  baseUrl: string
  headers: Record<string, string>
}

const MARKETS_BATCH_SIZE = 250

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

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []

  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))

  return chunks
}

async function coingeckoFetch<T>(path: string, revalidate: number): Promise<T> {
  const { baseUrl, headers } = getConfig()
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { accept: 'application/json', ...headers },
    next: { revalidate },
  })

  if (!response.ok) {
    throw new Error(`CoinGecko ${path.split('?')[0]} responded with ${response.status}`)
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
