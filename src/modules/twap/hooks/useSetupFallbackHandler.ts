import { useCallback } from 'react'

import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'

import { setupExtensibleFallbackHandler } from '../services/setupExtensibleFallbackHandler'

export function useSetupFallbackHandler() {
  const extensibleFallbackContext = useExtensibleFallbackContext()

  return useCallback(
    (domainVerifierAddress?: string) => {
      if (!extensibleFallbackContext) return

      setupExtensibleFallbackHandler(extensibleFallbackContext, domainVerifierAddress)
    },
    [extensibleFallbackContext]
  )
}
