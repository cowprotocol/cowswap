import { useCallback } from 'react'

import { useIsUnsupportedToken } from './useIsUnsupportedToken'

type NullishAddress = string | null | undefined

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAreUnsupportedTokens() {
  const isUnsupportedToken = useIsUnsupportedToken()

  return useCallback(
    ({ sellTokenAddress, buyTokenAddress }: { sellTokenAddress: NullishAddress; buyTokenAddress: NullishAddress }) => {
      return isUnsupportedToken(sellTokenAddress) || isUnsupportedToken(buyTokenAddress)
    },
    [isUnsupportedToken],
  )
}
