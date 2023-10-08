import { useUnsupportedTokens } from './useUnsupportedTokens'
import { useCallback } from 'react'

export function useIsUnsupportedTokens() {
  const unsupportedTokens = useUnsupportedTokens()

  return useCallback(
    ({ sellToken, buyToken }: { sellToken: string | null | undefined; buyToken: string | null | undefined }) => {
      if (!unsupportedTokens) return false

      return !!(
        (sellToken && unsupportedTokens[sellToken.toLowerCase()]) ||
        (buyToken && unsupportedTokens[buyToken.toLowerCase()])
      )
    },
    [unsupportedTokens]
  )
}
