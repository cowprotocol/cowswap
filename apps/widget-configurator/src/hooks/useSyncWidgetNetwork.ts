import { useEffect, useRef } from 'react'

import { useConnection, useSwitchChain } from 'wagmi'

import { useAvailableChains } from '@cowprotocol/common-hooks'
import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { WidgetMode } from '../configurator.types'

export function useSyncWidgetNetwork(
  chainId: SupportedChainId,
  setNetworkControlState: (chainId: SupportedChainId) => void,
  widgetMode: WidgetMode,
  isSolanaEnabled: boolean,
  solanaAddress?: string | null,
): void {
  const { chainId: walletChainId, isConnected } = useConnection()
  const { mutate: switchChain } = useSwitchChain()
  const availableChains = useAvailableChains({ excludeSolana: !isSolanaEnabled })
  const walletChainIdRef = useRef(walletChainId)
  const currentChainIdRef = useRef(chainId)
  const previousSolanaAddressRef = useRef(solanaAddress)
  // eslint-disable-next-line react-hooks/refs
  walletChainIdRef.current = walletChainId
  // eslint-disable-next-line react-hooks/refs
  currentChainIdRef.current = chainId

  // Bind network control to wallet network
  useEffect(() => {
    if (widgetMode === 'standalone' || !isConnected || !walletChainId) return
    // Solana is lent to the widget by a separate namespace, so the EVM wallet must not pull the
    // selection back to its own chain.
    if (isSolanaChain(currentChainIdRef.current)) return

    const walletSupportedChainId = walletChainId as SupportedChainId

    if (!availableChains.includes(walletSupportedChainId)) return

    currentChainIdRef.current = walletSupportedChainId
    setNetworkControlState(walletSupportedChainId)
  }, [availableChains, isConnected, walletChainId, setNetworkControlState, widgetMode])

  // Counterpart of the binding above for the Solana namespace, which has no wallet chain to report.
  // Keyed on the connect itself rather than on staying connected, so picking an EVM chain afterwards
  // is not pulled back to Solana.
  useEffect(() => {
    const justConnected = !previousSolanaAddressRef.current && !!solanaAddress
    previousSolanaAddressRef.current = solanaAddress

    if (!justConnected || widgetMode === 'standalone' || !isSolanaEnabled) return

    currentChainIdRef.current = SupportedChainId.SOLANA
    setNetworkControlState(SupportedChainId.SOLANA)
  }, [solanaAddress, widgetMode, isSolanaEnabled, setNetworkControlState])

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
      isSolanaChain(chainId) ||
      !availableChains.includes(chainId) ||
      walletChainIdRef.current === chainId ||
      currentChainIdRef.current === walletChainIdRef.current
    )
      return

    switchChain({ chainId })
  }, [availableChains, chainId, isConnected, switchChain, setNetworkControlState, widgetMode])
}
