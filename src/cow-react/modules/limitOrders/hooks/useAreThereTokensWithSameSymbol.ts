import { isAddress } from 'utils'
import { useCallback } from 'react'
import { useAllTokensList } from 'cow-react/common/hooks/useAllTokensList'

export function useAreThereTokensWithSameSymbol(): (tokenAddressOrSymbol: string | null | undefined) => boolean {
  const allTokens = useAllTokensList()

  return useCallback(
    (tokenAddressOrSymbol: string | null | undefined) => {
      if (!tokenAddressOrSymbol || isAddress(tokenAddressOrSymbol)) return false

      const tokens = allTokens.filter((token) => token.symbol === tokenAddressOrSymbol)

      return tokens.length > 1
    },
    [allTokens]
  )
}
