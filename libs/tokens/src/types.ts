import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'
import { TokenInfo } from '@uniswap/token-lists'

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
  logoUrl: string
  url: string
  enabled: boolean
  tokensCount: number
  version: string
}

export type TokensMap = { [tokenAddress: string]: TokenInfo }
