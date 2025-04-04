import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'

import { TokensMap } from '../types'

/**
 * Convert a tokens map to a list of tokens and sort them alphabetically
 */
export function tokenMapToListWithLogo(tokenMap: TokensMap, chainId: number): TokenWithLogo[] {
  return Object.values(tokenMap)
    .reduce<TokenWithLogo[]>((acc, token) => {
      if (token.chainId === chainId) {
        acc.push(
          token.lpTokenProvider
            ? LpToken.fromTokenToLp(token, token.lpTokenProvider)
            : TokenWithLogo.fromToken(token, token.logoURI),
        )
      }
      return acc
    }, [])
    .sort((a, b) => {
      if (!a.symbol || !b.symbol) return 0
      return a.symbol.localeCompare(b.symbol)
    })
}
