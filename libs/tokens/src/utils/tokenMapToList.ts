import { TokenWithLogo } from '@cowprotocol/common-const'

import { TokensMap } from '../types'
import { tokenWithLogoFromToken } from './tokenWithLogoFromToken'

export function tokenMapToList(tokenMap: TokensMap): TokenWithLogo[] {
  return Object.values(tokenMap)
    .sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
    .map((token) => tokenWithLogoFromToken(token, token.logoURI))
}
