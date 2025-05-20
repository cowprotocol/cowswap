import { TokensMap } from '../types'

/**
 * Merges multiple token maps into a single map, combining token properties and tags.
 * Later maps in the list take precedence for basic properties (overwriting earlier ones),
 * but tags are concatenated (preserving original list order).
 */
export function mergeTokenMaps(...tokenMaps: (TokensMap | null | undefined)[]): TokensMap {
  // Maps processed later in the array override properties of earlier maps when addresses match
  return tokenMaps.reduce<TokensMap>((acc, currentMap) => {
    if (!currentMap) return acc

    Object.entries(currentMap).forEach(([address, token]) => {
      const lowerAddress = address.toLowerCase()
      if (acc[lowerAddress]) {
        acc[lowerAddress] = {
          ...token, // Properties from the current token (processed earlier)
          ...acc[lowerAddress], // Properties from accumulated tokens override (processed later)
          tags: [...(acc[lowerAddress].tags || []), ...(token.tags || [])], // Tags are concatenated
        }
      } else {
        acc[lowerAddress] = token
      }
    })

    return acc
  }, {})
}
