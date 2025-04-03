import { TokensMap } from '../types'

/**
 * Merges multiple token maps into a single map, combining token properties and tags
 * Earlier® maps in the list take precedence for basic properties, but tags are concatenated
 */
export function mergeTokenMaps(...tokenMaps: (TokensMap | null | undefined)[]): TokensMap {
  return tokenMaps.reduce<TokensMap>((acc, currentMap) => {
    if (!currentMap) return acc

    Object.entries(currentMap).forEach(([address, token]) => {
      const lowerAddress = address.toLowerCase()
      if (acc[lowerAddress]) {
        acc[lowerAddress] = {
          ...token,
          ...acc[lowerAddress],
          tags: [...(acc[lowerAddress].tags || []), ...(token.tags || [])],
        }
      } else {
        acc[lowerAddress] = token
      }
    })

    return acc
  }, {})
}
