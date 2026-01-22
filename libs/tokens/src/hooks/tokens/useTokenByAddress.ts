import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getTokenAddressKey } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'

import { useTokensByAddressMap } from './useTokensByAddressMap'

export function useTokenByAddress(tokenAddress: Nullish<string>): Nullish<TokenWithLogo> {
  const tokensByAddress = useTokensByAddressMap()

  return useMemo(() => {
    if (!tokenAddress) {
      return null
    }

    return tokensByAddress[getTokenAddressKey(tokenAddress)]
  }, [tokensByAddress, tokenAddress])
}
