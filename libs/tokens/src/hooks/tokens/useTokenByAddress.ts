import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { Nullish } from '@cowprotocol/types'

import { useTokensByAddressMap } from './useTokensByAddressMap'

export function useTokenByAddress(tokenAddress: Nullish<string>): Nullish<TokenWithLogo> {
  const tokensByAddress = useTokensByAddressMap()

  return useMemo(() => {
    if (!tokenAddress) {
      return null
    }

    return tokensByAddress[tokenAddress.toLowerCase()]
  }, [tokensByAddress, tokenAddress])
}
