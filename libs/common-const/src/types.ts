import { LpTokenProvider, TokenInfo } from '@cowprotocol/types'
import { Token } from '@uniswap/sdk-core'

const emptyTokens = [] as string[]

export class TokenWithLogo extends Token {
  static fromToken(token: Token | TokenInfo, logoURI?: string): TokenWithLogo {
    return new TokenWithLogo(
      logoURI,
      token.chainId,
      token.address,
      token.decimals,
      token.symbol,
      token.name,
      undefined, // bypassChecksum parameter
      ('tags' in token && token.tags) || [],
    )
  }

  constructor(
    public logoURI: string | undefined, // <--- this is the only difference
    chainId: number,
    address: string,
    decimals: number,
    symbol?: string,
    name?: string,
    bypassChecksum?: boolean,
    public tags: string[] = [],
  ) {
    super(chainId, address, decimals, symbol, name, bypassChecksum)
  }
}

export class LpToken extends TokenWithLogo {
  static fromTokenToLp(token: Token | TokenInfo, lpTokenProvider?: LpTokenProvider): LpToken {
    return new LpToken(
      token instanceof Token ? emptyTokens : token.tokens || emptyTokens,
      lpTokenProvider,
      token.chainId,
      token.address,
      token.decimals,
      token.symbol,
      token.name,
      undefined,
      ('tags' in token && token.tags) || [],
    )
  }

  constructor(
    public tokens: string[],
    public lpTokenProvider: LpTokenProvider | undefined,
    chainId: number,
    address: string,
    decimals: number,
    symbol?: string,
    name?: string,
    bypassChecksum?: boolean,
    public tags: string[] = [],
  ) {
    super(undefined, chainId, address, decimals, symbol, name, bypassChecksum)
  }
}
