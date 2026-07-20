import { Token } from '@cowprotocol/currency'
import { LpTokenProvider, TokenInfo } from '@cowprotocol/types'

const emptyTokens = [] as string[]

// Solana Token-2022 mints are flagged in the token list via `extensions.isToken2022`. We surface that as
// a tag so it rides the existing `tags` pipeline. It is intentionally absent from the UI tag registry
// (`tokenListTags`), so it is not rendered as a chip.
export const TOKEN_2022_TAG = 'token-2022'

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
      resolveTags(token),
    )
  }

  constructor(
    public logoURI: string | undefined, // <--- this is the only difference
    chainId: number,
    address: string,
    decimals: number,
    symbol?: string,
    name?: string,
    public tags: string[] = [],
  ) {
    super(chainId, address, decimals, symbol, name)
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
    override tags: string[] = [],
  ) {
    super(undefined, chainId, address, decimals, symbol, name)
  }
}

export function getIsToken2022(token: { tags?: string[] } | undefined): boolean {
  return Boolean(token?.tags?.includes(TOKEN_2022_TAG))
}

// The token list flags Token-2022 mints under `extensions.isToken2022`; lift that to TOKEN_2022_TAG
// (deduped) so it survives both the parsed (`parseTokenInfo`) and raw-list (`buildTokensByAddress`)
// construction paths, and round-trips when an already-tagged token is re-converted.
function resolveTags(token: Token | TokenInfo): string[] {
  const tags = ('tags' in token && token.tags) || []
  const hasToken2022Extension = Boolean((token as { extensions?: { isToken2022?: boolean } }).extensions?.isToken2022)

  if (hasToken2022Extension && !tags.includes(TOKEN_2022_TAG)) {
    return [...tags, TOKEN_2022_TAG]
  }

  return tags
}
