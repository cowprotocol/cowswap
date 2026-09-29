import { useCallback } from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { useUnsupportedTokens } from './useUnsupportedTokens'

type NullishAddress = string | null | undefined

export function useIsUnsupportedToken(): (address: NullishAddress) => boolean {
  const unsupportedTokens = useUnsupportedTokens()

  return useCallback(
    (address: NullishAddress) => {
      const state = address && unsupportedTokens[getAddressKey(address)]

      return !!state
    },
    [unsupportedTokens],
  )
}
