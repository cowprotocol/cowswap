import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useSearchNonExistentToken } from './useSearchNonExistentToken'
import { useTokenByAddress } from './useTokenByAddress'

export function useTryFindToken(tokenAddress: string | null): {
  token: TokenWithLogo | null
  toBeImported: boolean
} {
  const foundByAddress = useTokenByAddress(tokenAddress) ?? null
  const foundInSearch = useSearchNonExistentToken(foundByAddress ? null : tokenAddress) ?? null

  return useMemo(() => {
    if (foundByAddress) {
      return {
        token: foundByAddress,
        toBeImported: false,
      }
    }

    return {
      token: foundInSearch,
      toBeImported: true,
    }
  }, [foundByAddress, foundInSearch])
}
