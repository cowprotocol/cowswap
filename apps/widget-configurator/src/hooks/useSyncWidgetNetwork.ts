import { useEffect, useRef } from 'react'

import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useConnection, useSwitchChain } from 'wagmi'

import { getNetworkOption, NetworkOption } from '../components/ui/controls/Select/NetworkControl'

export function useSyncWidgetNetwork(
  chainId: SupportedChainId,
  setNetworkControlState: (option: NetworkOption) => void,
  standaloneMode: boolean,
): void {
  const { chainId: walletChainId, isConnected } = useConnection()
  const { mutate: switchChain } = useSwitchChain()
  const walletChainIdRef = useRef(walletChainId)
  const currentChainIdRef = useRef(chainId)
  // eslint-disable-next-line react-hooks/refs
  walletChainIdRef.current = walletChainId
  // eslint-disable-next-line react-hooks/refs
  currentChainIdRef.current = chainId

  // Bind network control to wallet network
  useEffect(() => {
    if (!isConnected || !walletChainId) return

    const newNetwork = getNetworkOption(walletChainId as SupportedChainId)

    if (newNetwork) {
      currentChainIdRef.current = walletChainId as SupportedChainId
      setNetworkControlState(newNetwork)
    }
  }, [isConnected, walletChainId, setNetworkControlState])

  // Send a request to switch network when user changes network in the configurator
  useEffect(() => {
    if (
      !switchChain ||
      !isConnected ||
      standaloneMode ||
      walletChainIdRef.current === chainId ||
      currentChainIdRef.current === walletChainIdRef.current
    )
      return

    switchChain({ chainId })
  }, [chainId, isConnected, switchChain, setNetworkControlState, standaloneMode])
}
