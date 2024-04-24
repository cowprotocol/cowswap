import { useEffect, useRef } from 'react'

import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useWeb3ModalAccount, useSwitchNetwork } from '@web3modal/ethers5/react'

import { getNetworkOption, NetworkOption } from '../controls/NetworkControl'

export function useSyncWidgetNetwork(
  chainId: SupportedChainId,
  setNetworkControlState: (option: NetworkOption) => void
) {
  const { chainId: walletChainId, isConnected } = useWeb3ModalAccount()
  const { switchNetwork } = useSwitchNetwork()
  const walletChainIdRef = useRef(walletChainId)
  const currentChainId = useRef(chainId)
  walletChainIdRef.current = walletChainId

  // Bind network control to wallet network
  useEffect(() => {
    if (!isConnected || !walletChainId) return

    const newNetwork = getNetworkOption(walletChainId)

    if (newNetwork) {
      currentChainId.current = walletChainId
      setNetworkControlState(newNetwork)
    }
  }, [isConnected, walletChainId, setNetworkControlState])

  // Send a request to switch network when user changes network in the configurator
  useEffect(() => {
    if (
      !switchNetwork ||
      !isConnected ||
      walletChainIdRef.current === chainId ||
      currentChainId.current === walletChainIdRef.current
    )
      return

    switchNetwork(chainId)
  }, [chainId, isConnected, switchNetwork, setNetworkControlState])
}
