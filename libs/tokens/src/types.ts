import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'
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

export class TokenWithLogo extends Token {
  constructor(
    public logoURI: string | undefined,
    chainId: number,
    address: string,
    decimals: number,
    symbol?: string,
    name?: string,
    bypassChecksum?: boolean
  ) {
    super(chainId, address, decimals, symbol, name, bypassChecksum)
  }
}

export interface TokenListInfo {
  id: string
  name: string
  timestamp: string
  enabled: boolean
  version: string
  logoUrl?: string
  tokensCount: number
}

export type TokensMap = { [address: string]: TokenInfo }
