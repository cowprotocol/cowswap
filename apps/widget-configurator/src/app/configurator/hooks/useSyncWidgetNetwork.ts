import { useEffect, useRef } from 'react'

import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useWeb3ModalAccount, useSwitchNetwork } from '@web3modal/ethers5/react'

import { getNetworkOption, NetworkOption } from '../controls/NetworkControl'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSyncWidgetNetwork(
  chainId: SupportedChainId,
  setNetworkControlState: (option: NetworkOption) => void,
  standaloneMode: boolean
) {
  const { chainId: walletChainId, isConnected } = useWeb3ModalAccount()
  const { switchNetwork } = useSwitchNetwork()
  const walletChainIdRef = useRef(walletChainId)
  const currentChainIdRef = useRef(chainId)
  walletChainIdRef.current = walletChainId
  currentChainIdRef.current = chainId

  // Bind network control to wallet network
  useEffect(() => {
    if (!isConnected || !walletChainId) return

    const newNetwork = getNetworkOption(walletChainId)

    if (newNetwork) {
      currentChainIdRef.current = walletChainId
      setNetworkControlState(newNetwork)
    }
  }, [isConnected, walletChainId, setNetworkControlState])

  // Send a request to switch network when user changes network in the configurator
  useEffect(() => {
    if (
      !switchNetwork ||
      !isConnected ||
      standaloneMode ||
      walletChainIdRef.current === chainId ||
      currentChainIdRef.current === walletChainIdRef.current
    )
      return

    switchNetwork(chainId)
  }, [chainId, isConnected, switchNetwork, setNetworkControlState, standaloneMode])
}
