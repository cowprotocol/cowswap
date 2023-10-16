import { TokenWithLogo } from '@cowprotocol/common-const'

import { TokensMap } from '../types'

/**
 * Convert a tokens map to a list of tokens and sort them alphabetically
 */
export function tokenMapToListWithLogo(tokenMap: TokensMap): TokenWithLogo[] {
  return Object.values(tokenMap)
    .sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
    .map((token) => TokenWithLogo.fromToken(token, token.logoURI))
}
