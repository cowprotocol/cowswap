import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'

import { TokensMap } from '../types'

/**
 * Convert a tokens map to a list of tokens and sort them alphabetically
 */
export function tokenMapToListWithLogo(tokenMaps: TokensMap[], chainId: number): TokenWithLogo[] {
  const mergedMap = tokenMaps.reduce((acc, tokenMap) => {
    Object.entries(tokenMap).forEach(([tokenAddress, token]) => {
      const key = tokenAddress.toLowerCase()
      const existing = acc[key]

      if (existing) {
        // Append token tags
        if (token.tags?.length) {
          existing.tags = [...new Set([...(existing.tags || []), ...token.tags])]
        }
      } else {
        acc[key] = token
      }
    })

    return acc
  }, {} as TokensMap)

  return Object.values(mergedMap)
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
