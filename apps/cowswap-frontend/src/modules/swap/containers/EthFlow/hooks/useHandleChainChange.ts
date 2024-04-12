import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

/**
 * Handles EthFlow chain change by calling onDismiss when it happens
 */
export function useHandleChainChange(onDismiss: Command): null {
  const { chainId } = useWalletInfo()
  const prevChainId = usePrevious(chainId)

  useEffect(() => {
    if (chainId && prevChainId && chainId !== prevChainId) onDismiss()
  }, [chainId, onDismiss, prevChainId])

  return null
}
