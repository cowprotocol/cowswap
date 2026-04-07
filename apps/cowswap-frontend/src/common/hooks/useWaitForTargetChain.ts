import { useCallback, useEffect, useRef } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

interface PendingChainConfirmation {
  resolve: () => void
  targetChain: SupportedChainId
}

interface UseWaitForTargetChainResult {
  clearPendingChainConfirmation: () => void
  waitForTargetChain: (targetChain: SupportedChainId) => Promise<void>
}

export function useWaitForTargetChain(chainId: SupportedChainId): UseWaitForTargetChainResult {
  const chainIdRef = useRef(chainId)
  const pendingChainConfirmationRef = useRef<PendingChainConfirmation | null>(null)

  useEffect(() => {
    chainIdRef.current = chainId

    const pendingChainConfirmation = pendingChainConfirmationRef.current

    if (pendingChainConfirmation && pendingChainConfirmation.targetChain === chainId) {
      pendingChainConfirmationRef.current = null
      pendingChainConfirmation.resolve()
    }
  }, [chainId])

  const clearPendingChainConfirmation = useCallback(() => {
    pendingChainConfirmationRef.current = null
  }, [])

  const waitForTargetChain = useCallback((targetChain: SupportedChainId): Promise<void> => {
    if (chainIdRef.current === targetChain) {
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      pendingChainConfirmationRef.current = {
        resolve,
        targetChain,
      }
    })
  }, [])

  return {
    clearPendingChainConfirmation,
    waitForTargetChain,
  }
}
