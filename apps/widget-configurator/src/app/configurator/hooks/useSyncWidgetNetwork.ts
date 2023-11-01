import { useEffect } from 'react'

import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'

import { getNetworkOption, NetworkOption } from '../controls/NetworkControl'

export function useSyncWidgetNetwork(
  chainId: SupportedChainId,
  setNetworkControlState: (option: NetworkOption) => void
) {
  const { isDisconnected } = useAccount()
  const network = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const walletChainId = network.chain?.id

  // Bind network control to wallet network
  useEffect(() => {
    if (isDisconnected || !walletChainId) return

    const newNetwork = getNetworkOption(walletChainId)

    if (newNetwork) {
      setNetworkControlState(newNetwork)
    }
  }, [isDisconnected, walletChainId, setNetworkControlState])

  // Send a request to switch network if wallet network is different from widget network
  useEffect(() => {
    if (!switchNetwork || isDisconnected || walletChainId === chainId) return

    switchNetwork(chainId)
  }, [chainId, isDisconnected, switchNetwork, walletChainId, setNetworkControlState])
}
