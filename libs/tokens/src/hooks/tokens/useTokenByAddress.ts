import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cowprotocol/types'

import { useTokensByAddressMap } from './useTokensByAddressMap'

export function useTokenByAddress(tokenAddress: Nullish<string>): Nullish<TokenWithLogo> {
  const tokensByAddress = useTokensByAddressMap()

  return useMemo(() => {
    if (!tokenAddress) {
      return null
    }

    // The map is keyed by a lower-cased address. `getAddressKey` lower-cases EVM addresses but preserves
    // case for non-EVM ones (e.g. Solana base58), so fall back to the lower-cased key for those to resolve.
    return tokensByAddress[getAddressKey(tokenAddress)] ?? tokensByAddress[tokenAddress.toLowerCase()]
  }, [tokensByAddress, tokenAddress])
}
