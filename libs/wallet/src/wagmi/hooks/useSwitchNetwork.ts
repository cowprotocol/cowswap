import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useSwitchChain } from 'wagmi'

export function useSwitchNetwork(): (chainId: SupportedChainId) => Promise<void> {
  const { mutateAsync: switchChain } = useSwitchChain()

  return useCallback(
    async (chainId: SupportedChainId) => {
      await switchChain({ chainId })
    },
    [switchChain],
  )
}
