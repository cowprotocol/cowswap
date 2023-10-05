import { TokenWithLogo } from '@cowprotocol/common-const'

import { TokensMap } from '../types'

export function tokenMapToList(tokenMap: TokensMap): TokenWithLogo[] {
  return Object.values(tokenMap)
    .sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
    .map(
      (token) =>
        new TokenWithLogo(token.logoURI, token.chainId, token.address, token.decimals, token.symbol, token.name)
    )
}
