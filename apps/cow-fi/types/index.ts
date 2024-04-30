export interface PlatformData {
  contractAddress: string
  decimalPlace: number
}

export interface Platforms {
  [key: string]: PlatformData
}

export interface TokenInfo {
  id: string
  name: string
  symbol: string
  priceUsd: string | null
  change24h: string | null
  volume: string | null
  marketCap: string | null
  image: {
    large: string | null
  }
  marketCapRank: number | null
  // market_data, TODO: is this needed???
}

export interface TokenDetails extends TokenInfo {
  description: string
  metaDescription: string
  platforms: Platforms
  allTimeHigh: string | null
  allTimeLow: string | null
}

export interface MetricsData {
  totalVolume: string
  tradesCount: string
  tradesCountLastModified: string
  totalSurplus: string
  totalSurplusLastModified: string
}

export interface PaginationParam { 
  page?: number, 
  pageSize?: number
}