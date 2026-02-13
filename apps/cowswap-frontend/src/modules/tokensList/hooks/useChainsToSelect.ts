import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useAvailableChains, useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useIsCoinbaseWallet, useWalletSupportedChainIds, useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedNetworks, useRoutesAvailability } from 'entities/bridgeProvider'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade'

import { useShouldHideNetworkSelector } from 'common/hooks/useShouldHideNetworkSelector'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

import { ChainsToSelectState } from '../types'
import { createOutputChainsState } from '../utils/chainsState'
import { mapChainInfo } from '../utils/mapChainInfo'
import { sortChainsByDisplayOrder } from '../utils/sortChainsByDisplayOrder'

// Re-export for tests and external usage
export { createInputChainsState, createOutputChainsState } from '../utils/chainsState'

/**
 * Returns an array of chains to select in the token selector widget.
 * The array depends on sell/buy token selection.
 * For the sell token we return all supported chains.
 * For the buy token we return all app-supported chains with disabled state for non-bridgeable targets.
 * based on runtime checks (swap route + wallet compatibility).
 */
export function useChainsToSelect(): ChainsToSelectState | undefined {
  const { chainId } = useWalletInfo()
  const { field, selectedTargetChainId = chainId, tradeType, oppositeToken } = useSelectTokenWidgetState()
  const { data: bridgeSupportedNetworks, isLoading } = useBridgeSupportedNetworks()
  const isBridgingEnabled = useIsBridgingEnabled() // Reads from Jotai atom
  const availableChains = useAvailableChains()
  const isAdvancedTradeType = tradeType === TradeType.LIMIT_ORDER || tradeType === TradeType.ADVANCED_ORDERS
  const shouldHideNetworkSelector = useShouldHideNetworkSelector()
  const isCoinbaseWallet = useIsCoinbaseWallet()
  const walletSupportedChainIds = useWalletSupportedChainIds()

  const supportedChains = useMemo(() => {
    return availableChains.reduce((acc, id) => {
      const info = CHAIN_INFO[id]
      if (info) acc.push(mapChainInfo(id, info))
      return acc
    }, [] as ChainInfo[])
  }, [availableChains])

  // When selecting the BUY token, the bridge "source chain" is the SELL token's chain (oppositeToken),
  // not necessarily the wallet network. This keeps chain availability accurate when wallet network != trade network.
  const sourceChainId =
    field === Field.OUTPUT && oppositeToken?.chainId ? (oppositeToken.chainId as SupportedChainId) : chainId

  // Only restrict chains for Coinbase SDK wallets with detected SCW capabilities.
  // For Coinbase SCW, capability keys = chains where the smart contract is deployed.
  // Coinbase EOA (no atomic capabilities) -> walletSupportedChainIds is undefined -> no filtering.
  const walletUnsupportedChainIds = useMemo(() => {
    if (!isCoinbaseWallet || !walletSupportedChainIds) return undefined
    // Exclude source chain (chainId) — user is connected to it, bridging FROM it is valid
    return new Set(availableChains.filter((id) => id !== chainId && !walletSupportedChainIds.has(id)))
  }, [isCoinbaseWallet, walletSupportedChainIds, availableChains, chainId])

  const destinationChainIds = useMemo(() => supportedChains.map((c) => c.id), [supportedChains])
  const isBuyField = field === Field.OUTPUT
  const routesAvailability = useRoutesAvailability(
    isBuyField && isBridgingEnabled ? sourceChainId : undefined,
    destinationChainIds,
  )

  return useMemo(() => {
    // TODO: Limit/TWAP orders currently disable chain selection; revisit when SC wallet bridging supports advanced trades.
    if (!field || !chainId || !sourceChainId || !isBridgingEnabled || isAdvancedTradeType) return undefined

    const chainInfo = CHAIN_INFO[sourceChainId]
    if (!chainInfo) return undefined

    if (field === Field.INPUT) {
      return {
        defaultChainId: selectedTargetChainId,
        chains: shouldHideNetworkSelector ? [] : sortChainsByDisplayOrder(supportedChains),
        isLoading: false,
        disabledChainIds: walletUnsupportedChainIds,
        walletUnsupportedChainIds,
      }
    }

    // BUY token selection - include disabled chains info
    // Note: walletUnsupportedChainIds is intentionally NOT passed for OUTPUT.
    // Instead of disabling destination chains, we show a blocking warning in the swap form
    // when the user tries to bridge to an unsupported chain (see useShouldBlockUnsupportedDestination).
    return createOutputChainsState({
      selectedTargetChainId,
      chainId: sourceChainId,
      currentChainInfo: mapChainInfo(sourceChainId, chainInfo),
      bridgeSupportedNetworks,
      supportedChains,
      isLoading,
      routesAvailability,
      walletUnsupportedChainIds: undefined,
    })
  }, [
    field,
    selectedTargetChainId,
    chainId,
    sourceChainId,
    bridgeSupportedNetworks,
    supportedChains,
    isLoading,
    isBridgingEnabled,
    isAdvancedTradeType,
    routesAvailability,
    shouldHideNetworkSelector,
    walletUnsupportedChainIds,
  ])
}
