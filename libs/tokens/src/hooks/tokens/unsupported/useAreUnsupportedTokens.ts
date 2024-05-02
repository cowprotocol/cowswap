import { useCallback } from 'react'

import { useIsUnsupportedToken } from './useIsUnsupportedToken'

type NullishAddress = string | null | undefined

export function useAreUnsupportedTokens() {
  const isUnsupportedToken = useIsUnsupportedToken()

  return useCallback(
    ({ sellToken, buyToken }: { sellToken: NullishAddress; buyToken: NullishAddress }) => {
      return isUnsupportedToken(sellToken) || isUnsupportedToken(buyToken)
    },
    [isUnsupportedToken]
  )
}
