import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'

import { TokenListCategory, TokensMap } from '../types'

/**
 * Convert a tokens map to a list of tokens and sort them alphabetically
 */
export function tokenMapToListWithLogo(
  tokenMap: TokensMap,
  category: TokenListCategory,
  chainId: number,
): TokenWithLogo[] {
  const isCoWAMM = category === TokenListCategory.COW_AMM_LP

  return Object.values(tokenMap)
    .filter((token) => token.chainId === chainId)
    .sort((a, b) => a.symbol.localeCompare(b.symbol))
    .map((token) =>
      token.tokens ? LpToken.fromTokenToLp(token, isCoWAMM) : TokenWithLogo.fromToken(token, token.logoURI),
    )
}
