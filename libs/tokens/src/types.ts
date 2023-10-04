import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TokenInfo } from '@uniswap/token-lists'

export interface TokenListWithUrl {
  id: string // nanoid
  enabledByDefault?: boolean
  url: string
}

export interface TokenListWithEnsName {
  id: string // nanoid
  enabledByDefault?: boolean
  ensName: string
}

export type TokenList = TokenListWithUrl | TokenListWithEnsName

export type TokenListsByNetwork = Record<SupportedChainId, ReadonlyArray<TokenList>>

export interface TokenListInfo {
  id: string
  name: string
  timestamp: string
  enabled: boolean
  version: string
  url: string
  logoUrl?: string
  tokensCount: number
}

export type TokensMap = { [address: string]: TokenInfo }
