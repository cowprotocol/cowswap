import { Token } from '@uniswap/sdk-core'

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

export interface TokenList {
  id: string
  name: string
  logoUrl: string
  url: string
  enabled: boolean
  tokensCount: number
  version: string
}
