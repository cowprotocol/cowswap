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
  priceUsd: number | null
  change24h: number | null
  volume: number | null
  marketCap: number | null
  image: {
    large: string | null
  }
  marketCapRank: number | null
}

export interface TokenDetails extends TokenInfo {
  description: string
  platforms: Platforms
  allTimeHigh: number | null
  allTimeLow: number | null
}

export interface PaginationParam {
  page?: number
  pageSize?: number
}
