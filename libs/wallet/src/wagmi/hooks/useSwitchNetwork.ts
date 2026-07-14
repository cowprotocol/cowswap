import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useConnection, useSwitchChain } from 'wagmi'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { walletInfoAtom } from '../../api/state'

export function useSwitchNetwork(): (chainId: SupportedChainId) => Promise<void> {
  const { mutateAsync: switchChain } = useSwitchChain()
  const { isConnected } = useConnection()
  const setWalletInfo = useSetAtom(walletInfoAtom)

  return useCallback(
    async (chainId: SupportedChainId) => {
      if (isConnected) {
        await switchChain({ chainId })
      } else {
        setWalletInfo((prev) => ({ ...prev, chainId }))
      }
    },
    [switchChain, isConnected, setWalletInfo],
  )
}
