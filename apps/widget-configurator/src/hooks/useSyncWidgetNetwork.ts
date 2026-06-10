import { useEffect, useRef } from 'react'

import { useAvailableChains } from '@cowprotocol/common-hooks'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useConnection, useSwitchChain } from 'wagmi'

import { WidgetMode } from '../configurator.types'

export function useSyncWidgetNetwork(
  chainId: SupportedChainId,
  setNetworkControlState: (chainId: SupportedChainId) => void,
  widgetMode: WidgetMode,
): void {
  const { chainId: walletChainId, isConnected } = useConnection()
  const { mutate: switchChain } = useSwitchChain()
  const availableChains = useAvailableChains()
  const walletChainIdRef = useRef(walletChainId)
  const currentChainIdRef = useRef(chainId)
  // eslint-disable-next-line react-hooks/refs
  walletChainIdRef.current = walletChainId
  // eslint-disable-next-line react-hooks/refs
  currentChainIdRef.current = chainId

  // Bind network control to wallet network
  useEffect(() => {
    if (!isConnected || !walletChainId) return

    const walletSupportedChainId = walletChainId as SupportedChainId

    if (!availableChains.includes(walletSupportedChainId)) return

    currentChainIdRef.current = walletSupportedChainId
    setNetworkControlState(walletSupportedChainId)
  }, [availableChains, isConnected, walletChainId, setNetworkControlState])

  // Send a request to switch network when user changes network in the configurator
  useEffect(() => {
    if (
      !switchChain ||
      !isConnected ||
      widgetMode === 'standalone' ||
      walletChainIdRef.current === chainId ||
      currentChainIdRef.current === walletChainIdRef.current
    )
      return

    switchChain({ chainId })
  }, [chainId, isConnected, switchChain, setNetworkControlState, widgetMode])
}
