export type Address = `0x${string}`

export interface FetchTokensResult {
  chainId: number
  name: string
  address: Address
  decimals: number
  symbol: string
  logoURI: string
  coinGeckoId: string
  priceUsd: number
  price24hChange: number
  volume24h: number
  marketCap: number
}

export interface FetchTokensApiResult {
  code: number
  status: 'success' | 'failed'
  hasNext: boolean
  data: FetchTokensResult[]
}

export type NDimensionalMap<Key extends unknown[], Value> = Key extends [infer First, ...infer Rest]
  ? Map<First, NDimensionalMap<Rest, Value>>
  : Value
export type TokenLogoCache = NDimensionalMap<[number, string], string>
