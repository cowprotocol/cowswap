import { useEffect, useRef } from 'react'

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
  const walletChainIdRef = useRef(walletChainId)
  walletChainIdRef.current = walletChainId

  // Bind network control to wallet network
  useEffect(() => {
    if (isDisconnected || !walletChainId) return

    const newNetwork = getNetworkOption(walletChainId)

    if (newNetwork) {
      setNetworkControlState(newNetwork)
    }
  }, [isDisconnected, walletChainId, setNetworkControlState])

  // Send a request to switch network when user changes network in the configurator
  useEffect(() => {
    if (!switchNetwork || isDisconnected || walletChainIdRef.current === chainId) return

    switchNetwork(chainId)
  }, [chainId, isDisconnected, switchNetwork, setNetworkControlState])
}
