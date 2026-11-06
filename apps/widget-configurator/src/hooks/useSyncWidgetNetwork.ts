import { useEffect, useRef } from 'react'

import { useConnection, useSwitchChain } from 'wagmi'

import { useAvailableChains } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { WidgetMode } from '../configurator.types'

export function useSyncWidgetNetwork(
  chainId: SupportedChainId,
  setNetworkControlState: (chainId: SupportedChainId) => void,
  widgetMode: WidgetMode,
): void {
  const { chainId: walletChainId, isConnected } = useConnection()
  const { mutate: switchChain } = useSwitchChain()
  const availableChains = useAvailableChains({ excludeSolana: true })
  const walletChainIdRef = useRef(walletChainId)
  const currentChainIdRef = useRef(chainId)
  // eslint-disable-next-line react-hooks/refs
  walletChainIdRef.current = walletChainId
  // eslint-disable-next-line react-hooks/refs
  currentChainIdRef.current = chainId

  // Bind network control to wallet network
  useEffect(() => {
    if (widgetMode === 'standalone' || !isConnected || !walletChainId) return

    const walletSupportedChainId = walletChainId as SupportedChainId

    if (!availableChains.includes(walletSupportedChainId)) return

    currentChainIdRef.current = walletSupportedChainId
    setNetworkControlState(walletSupportedChainId)
  }, [availableChains, isConnected, walletChainId, setNetworkControlState, widgetMode])

  // Persisted configurator state may still hold a chain that is no longer available (e.g. Solana)
  useEffect(() => {
    if (availableChains.includes(chainId)) return

    const walletSupportedChainId = walletChainId as SupportedChainId
    const isWalletChainAvailable =
      widgetMode === 'dapp' && isConnected && availableChains.includes(walletSupportedChainId)

    setNetworkControlState(isWalletChainAvailable ? walletSupportedChainId : SupportedChainId.MAINNET)
  }, [availableChains, chainId, isConnected, walletChainId, setNetworkControlState, widgetMode])

  // Send a request to switch network when user changes network in the configurator
  useEffect(() => {
    if (
      !switchChain ||
      !isConnected ||
      widgetMode === 'standalone' ||
      !availableChains.includes(chainId) ||
      walletChainIdRef.current === chainId ||
      currentChainIdRef.current === walletChainIdRef.current
    )
      return

    switchChain({ chainId })
  }, [availableChains, chainId, isConnected, switchChain, setNetworkControlState, widgetMode])
}
