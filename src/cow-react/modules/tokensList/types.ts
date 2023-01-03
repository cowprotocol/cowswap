import type { SupportedChainId } from '@cowprotocol/cow-sdk'

export enum TokensListsWorkerEvents {
  NETWORK_CHANGED,
}

export type TokensListsByChainId = {
  [key in SupportedChainId]: { url: string; isActive: boolean }[]
}

export interface RawToken {
  symbol: string
  name: string
  address: string
  logoURL: string
  decimals: number
  chainId: number
}

export interface TokensListConfig {
  name: string
  timestamp: string
  version: {
    patch: number
    minor: number
    major: number
  }
  logoURL: string
  keywords: string[]
  tokens: RawToken[]
}
