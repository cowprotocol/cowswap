export enum TokensListsWorkerEvents {
  NETWORK_CHANGED,
}

export interface RawToken {
  symbol: string
  name: string
  address: string
  logoURL: string
  decimals: number
  chainId: number
}

export type TokenDto = Omit<RawToken, 'chainId'>

export type TokensListVersion = {
  patch: number
  minor: number
  major: number
}

export interface TokensListConfig {
  name: string
  timestamp: string
  version: TokensListVersion
  logoURL: string
  keywords: string[]
  tokens: RawToken[]
}

// Because importing of SupportedChainid adds the whole '@cowprotocol/cow-sdk' to the bundle
export const supportedChains = [1, 5, 100]
