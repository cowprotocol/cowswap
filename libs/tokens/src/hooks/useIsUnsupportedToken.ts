import { useUnsupportedTokens } from './useUnsupportedTokens'
import { useCallback } from 'react'

export function useIsUnsupportedToken() {
  const unsupportedTokens = useUnsupportedTokens()

  return useCallback(
    (address?: string) => {
      const state = address && unsupportedTokens[address.toLowerCase()]

      if (state) {
        return {
          ...state,
          address,
        }
      }
      return false
    },
    [unsupportedTokens]
  )
}
