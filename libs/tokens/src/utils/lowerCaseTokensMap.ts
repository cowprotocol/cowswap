import { TokensMap } from '../types'

export function lowerCaseTokensMap(tokensMap: TokensMap): TokensMap {
  return Object.entries(tokensMap).reduce<TokensMap>((acc, [address, token]) => {
    const addressLowerCased = address.toLowerCase()

    if (!acc[addressLowerCased]) {
      acc[addressLowerCased] = token
    }

    return acc
  }, {})
}
