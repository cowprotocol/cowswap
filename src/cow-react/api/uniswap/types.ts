import { SupportedChainId } from '@cowprotocol/cow-sdk'

export type Address = `0x${string}`
export type Chain =
  | 'ARBITRUM'
  | 'ETHEREUM'
  | 'ETHEREUM_GOERLI'
  | 'OPTIMISM'
  | 'POLYGON'
  | 'CELO'
  | 'BNB'
  | 'UNKNOWN_CHAIN'

export interface FetchTokensResult {
  chainId: SupportedChainId
  id: string
  decimals: number
  name: string
  chain: Chain
  standard: string
  address: Address
  symbol: string
  project: {
    id: string
    logoUrl: string
    safetyLevel: string
  }
}

export interface FetchTokensApiResult {
  searchTokens: Omit<FetchTokensResult, 'chainId'>[]
}

export type NDimensionalMap<Key extends unknown[], Value> = Key extends [infer First, ...infer Rest]
  ? Map<First, NDimensionalMap<Rest, Value>>
  : Value
export type TokenLogoCache = NDimensionalMap<[SupportedChainId, string], string>
