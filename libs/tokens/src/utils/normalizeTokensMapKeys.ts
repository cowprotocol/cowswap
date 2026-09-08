import { getAddressKey } from '@cowprotocol/cow-sdk'

import { TokensMap } from '../types'

export function normalizeTokensMapKeys(tokensMap: TokensMap): TokensMap {
  if (!tokensMap) {
    return {}
  }

  return Object.entries(tokensMap).reduce<TokensMap>((acc, [address, token]) => {
    const addressKey = getAddressKey(address)

    if (!acc[addressKey]) {
      acc[addressKey] = token
    }

    return acc
  }, {})
}
