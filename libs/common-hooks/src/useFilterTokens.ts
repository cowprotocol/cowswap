import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isAddress } from '@cowprotocol/common-utils'

export function useFilterTokens(tokens: TokenWithLogo[], query: string): TokenWithLogo[] {
  return useMemo(() => {
    // only calc anything if we actually have more than 1 token in list
    // and the user is actively searching tokens
    if (tokens.length === 0 || !query.length) {
      return tokens
    }

    // if user is searching by address
    const searchAddress = isAddress(query)
    const queryParts = query
      .toLowerCase()
      .split(/\+s/)
      .filter((s) => s.length)

    return tokens.filter((token: TokenWithLogo) => {
      if (searchAddress) {
        // first search by address if its address
        return 'address' in token && searchAddress.toLowerCase() === token.address.toLowerCase()
      } else {
        // else search by symbol or name
        return [token.name?.toLowerCase(), token.symbol?.toLowerCase()].some((tokenPart: string | undefined) =>
          queryParts.some((queryPart: string) => tokenPart?.includes(queryPart))
        )
      }
    })
  }, [tokens, query])
}
