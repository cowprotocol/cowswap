import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useConnection } from 'wagmi'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useNetworkSwitchUnsupported } from '../../api/hooks/useNetworkSwitchUnsupported'
import { walletInfoAtom } from '../../api/state'
import { SUPPORTED_REOWN_NETWORKS } from '../../reown/networks'
import { reownAppKit } from '../config'

export function useSwitchNetwork(): (chainId: SupportedChainId) => Promise<void> {
  const { isConnected } = useConnection()
  const networkSwitchUnsupported = useNetworkSwitchUnsupported()
  const setWalletInfo = useSetAtom(walletInfoAtom)

  return useCallback(
    async (chainId: SupportedChainId) => {
      if (networkSwitchUnsupported) return

      if (isConnected) {
        const network = SUPPORTED_REOWN_NETWORKS.find(({ id }) => id === chainId)

        if (!network) {
          console.error('Unknown network to switch on', chainId)
          return
        }
        await reownAppKit.switchNetwork(network, { throwOnFailure: true })
      } else {
        setWalletInfo((prev) => ({ ...prev, chainId }))
      }
    },
    [isConnected, networkSwitchUnsupported, setWalletInfo],
  )
}

//asd
