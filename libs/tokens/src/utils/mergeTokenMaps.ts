import { TokensMap } from '../types'

/**
 * Merges multiple token maps into a single map, combining token properties and tags
 * Earlier® maps in the list take precedence for basic properties, but tags are concatenated
 */
export function mergeTokenMaps(...tokenMaps: (TokensMap | null | undefined)[]): TokensMap {
  // Note: Earlier maps in the original list (processed later here)
  // have their properties OVERRIDDEN by later maps in the original list (processed earlier here).
  return tokenMaps.reduce<TokensMap>((acc, currentMap) => {
    if (!currentMap) return acc

    Object.entries(currentMap).forEach(([address, token]) => {
      const lowerAddress = address.toLowerCase()
      if (acc[lowerAddress]) {
        acc[lowerAddress] = {
          ...token, // Properties from the current map (earlier in original list)
          ...acc[lowerAddress], // Properties from the accumulator (later in original list - these override)
          // Tags are concatenated, preserving original list order (acc first, then token)
          tags: [...(acc[lowerAddress].tags || []), ...(token.tags || [])],
        }
      } else {
        acc[lowerAddress] = token
      }
    })

    return acc
  }, {})
}
