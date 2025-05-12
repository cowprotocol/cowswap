import { useCallback } from 'react'

import { useIsUnsupportedToken } from './useIsUnsupportedToken'

type NullishAddress = string | null | undefined

export function useAreUnsupportedTokens() {
  const isUnsupportedToken = useIsUnsupportedToken()

  return useCallback(
    ({ sellTokenAddress, buyTokenAddress }: { sellTokenAddress: NullishAddress; buyTokenAddress: NullishAddress }) => {
      return isUnsupportedToken(sellTokenAddress) || isUnsupportedToken(buyTokenAddress)
    },
    [isUnsupportedToken],
  )
}
