import { useUnsupportedTokens } from './useUnsupportedTokens'
import { useCallback } from 'react'

type NullishAddress = string | null | undefined

export function useIsUnsupportedToken(): (address: NullishAddress) => boolean {
  const unsupportedTokens = useUnsupportedTokens()

  return useCallback(
    (address: NullishAddress) => {
      const state = address && unsupportedTokens[address.toLowerCase()]

      return !!state
    },
    [unsupportedTokens]
  )
}
