import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TokenInfo } from '@uniswap/token-lists'

export type TokenListSource = { ensName: string } | { url: string }

export interface TokenListWithUrl {
  id: string // nanoid
  priority?: number
  enabledByDefault?: boolean
  url: string
}

export interface TokenListWithEnsName {
  id: string // nanoid
  priority?: number
  enabledByDefault?: boolean
  ensName: string
}

export type TokenList = TokenListWithUrl | TokenListWithEnsName

export type TokenListsByNetwork = Record<SupportedChainId, ReadonlyArray<TokenList>>

export interface TokenListInfo {
  source: TokenListSource
  id: string
  name: string
  timestamp: string
  version: string
  priority?: number
  logoUrl?: string
  tokensCount: number
}

export type TokensMap = { [address: string]: TokenInfo }

export type ActiveTokensListsMap = { [listId: string]: boolean | undefined }
