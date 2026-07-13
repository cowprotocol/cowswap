import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useConnection } from 'wagmi'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useAppKitNetwork } from '@reown/appkit/react'

import { walletInfoAtom } from '../../api/state'
import { SUPPORTED_REOWN_NETWORKS } from '../../reown/networks'

export function useSwitchNetwork(): (chainId: SupportedChainId) => Promise<void> {
  const { isConnected } = useConnection()
  const setWalletInfo = useSetAtom(walletInfoAtom)
  const { switchNetwork } = useAppKitNetwork()

  return useCallback(
    async (chainId: SupportedChainId) => {
      if (isConnected) {
        const network = SUPPORTED_REOWN_NETWORKS.find(({ id }) => id === chainId)

        if (!network) {
          console.error('Unknown network to switch on', chainId)
          return
        }
        await switchNetwork(network)
      } else {
        setWalletInfo((prev) => ({ ...prev, chainId }))
      }
    },
    [switchNetwork, isConnected, setWalletInfo],
  )
}
