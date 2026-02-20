import { ChainId } from '@cowprotocol/cow-sdk'
import { LpTokenProvider, TokenInfo } from '@cowprotocol/types'
import { Token } from '@uniswap/sdk-core'

const emptyTokens = [] as string[]

function parseEvmChainId(chainId: string | number): number {
  if (typeof chainId === 'number') return chainId

  if (typeof chainId !== 'string') {
    throw new Error(
      `Invalid EVM chainId: expected string or number, got ${typeof chainId}. Value: ${JSON.stringify(chainId)}`,
    )
  }

  return Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10)
}

export class TokenWithLogo extends Token {
  static fromToken(token: Token | TokenInfo, logoURI?: string): TokenWithLogo {
    if (!token || token.chainId === undefined || !token.address) {
      throw new Error('TokenWithLogo.fromToken requires a token with chainId and address')
    }

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
    chainId: ChainId,
    address: string,
    decimals: number,
    symbol?: string,
    name?: string,
    bypassChecksum?: boolean,
    public tags: string[] = [],
  ) {
    // Uniswap SDK Token only accepts number, so we parse string chainIds for EVM chains
    const parsedChainId = parseEvmChainId(chainId)
    super(parsedChainId, address, decimals, symbol, name, bypassChecksum)
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
    chainId: string | number,
    address: string,
    decimals: number,
    symbol?: string,
    name?: string,
    bypassChecksum?: boolean,
    override tags: string[] = [],
  ) {
    super(undefined, chainId, address, decimals, symbol, name, bypassChecksum)
  }
}
