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
