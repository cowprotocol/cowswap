import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useAvailableChains, useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade/types'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

import { ChainsToSelectState } from '../types'
import { mapChainInfo } from '../utils/mapChainInfo'
import { sortChainsByDisplayOrder } from '../utils/sortChainsByDisplayOrder'

/**
 * Returns an array of chains to select in the token selector widget.
 * The array depends on sell/buy token selection.
 * For the sell token we return all supported chains.
 * For the buy token we return current network + all bridge target networks.
 */
export function useChainsToSelect(): ChainsToSelectState | undefined {
  const { chainId } = useWalletInfo()
  const { field, selectedTargetChainId = chainId, tradeType } = useSelectTokenWidgetState()
  const { data: bridgeSupportedNetworks, isLoading } = useBridgeSupportedNetworks()
  const isBridgingEnabled = useIsBridgingEnabled()
  const availableChains = useAvailableChains()
  const isAdvancedTradeType = tradeType === TradeType.LIMIT_ORDER || tradeType === TradeType.ADVANCED_ORDERS

  const supportedChains = useMemo(() => {
    return availableChains.reduce((acc, id) => {
      const info = CHAIN_INFO[id]

      if (info) {
        acc.push(mapChainInfo(id, info))
      }

      return acc
    }, [] as ChainInfo[])
  }, [availableChains])

  // Compute output chains state for BUY token selection
  const outputChainsState = useMemo(() => {
    if (!field || !chainId) return undefined

    const chainInfo = CHAIN_INFO[chainId]
    if (!chainInfo) return undefined

    // Limit/TWAP orders don't support chain selection - return undefined for both SELL and BUY
    // These trade types rely on wallet/header network switcher instead
    if (isAdvancedTradeType) {
      return undefined
    }

    if (!isBridgingEnabled) return undefined

    if (field === Field.INPUT) {
      return undefined
    }

    const currentChainInfo = mapChainInfo(chainId, chainInfo)

    return createOutputChainsState({
      selectedTargetChainId,
      chainId,
      currentChainInfo,
      bridgeSupportedNetworks,
      isLoading,
    })
  }, [
    field,
    selectedTargetChainId,
    chainId,
    bridgeSupportedNetworks,
    isLoading,
    isBridgingEnabled,
    isAdvancedTradeType,
  ])

  return useMemo(() => {
    if (!field || !chainId) return undefined

    const chainInfo = CHAIN_INFO[chainId]
    if (!chainInfo) return undefined

    // Limit/TWAP orders don't support chain selection - return undefined for both SELL and BUY
    // These trade types rely on wallet/header network switcher instead
    if (isAdvancedTradeType) {
      return undefined
    }

    if (!isBridgingEnabled) return undefined

    if (field === Field.INPUT) {
      return createInputChainsState(selectedTargetChainId, supportedChains)
    }

    // For BUY token selection, include disabled chains info
    if (outputChainsState) {
      return outputChainsState
    }

    return undefined
  }, [
    field,
    selectedTargetChainId,
    chainId,
    isBridgingEnabled,
    supportedChains,
    isAdvancedTradeType,
    outputChainsState,
  ])
}

function filterDestinationChains(bridgeSupportedNetworks: ChainInfo[] | undefined): ChainInfo[] | undefined {
  // Show only chains the app supports.
  return bridgeSupportedNetworks?.filter((chain) => chain.id in SupportedChainId)
}

// Sell-side selector intentionally limits chains to the wallet-supported list; bridge destinations never appear here.
export function createInputChainsState(
  selectedTargetChainId: SupportedChainId | number,
  supportedChains: ChainInfo[],
): ChainsToSelectState {
  return {
    defaultChainId: selectedTargetChainId,
    chains: sortChainsByDisplayOrder(supportedChains),
    isLoading: false,
  }
}

interface CreateOutputChainsOptions {
  selectedTargetChainId: SupportedChainId | number
  chainId: SupportedChainId
  currentChainInfo: ChainInfo
  bridgeSupportedNetworks: ChainInfo[] | undefined
  isLoading: boolean
}

export function createOutputChainsState({
  selectedTargetChainId,
  chainId,
  currentChainInfo,
  bridgeSupportedNetworks,
  isLoading,
}: CreateOutputChainsOptions): ChainsToSelectState {
  const destinationChains = filterDestinationChains(bridgeSupportedNetworks) ?? []
  const isSourceChainSupportedByBridge = Boolean(destinationChains.some((chain) => chain.id === chainId))

  if (process.env.NODE_ENV !== 'production') {
    const destinationIds = destinationChains.map((c) => c.id)
    const bridgeIds = bridgeSupportedNetworks?.map((c) => c.id)

    console.debug('[useChainsToSelect] output chains', {
      sourceChainId: chainId,
      selectedTargetChainId,
      bridgeSupportedNetworkIds: bridgeIds,
      filteredDestinationIds: destinationIds,
      isSourceChainSupportedByBridge,
    })
  }

  // Always include the current chain for same-chain swaps (no bridging required)
  const chainSet = new Set(destinationChains.map((chain) => chain.id))
  const chainsWithCurrent = chainSet.has(chainId) ? destinationChains : [currentChainInfo, ...destinationChains]

  const orderedDestinationChains = sortChainsByDisplayOrder(chainsWithCurrent)
  const hasSelectedTarget = orderedDestinationChains.some((chain) => chain.id === selectedTargetChainId)
  const fallbackChainId =
    orderedDestinationChains.find((chain) => chain.id === chainId)?.id ?? orderedDestinationChains[0]?.id
  const resolvedDefaultChainId = hasSelectedTarget ? selectedTargetChainId : fallbackChainId
  const disabledChainIds = isSourceChainSupportedByBridge
    ? undefined
    : new Set<number>(destinationChains.map((c) => c.id))

  // Always return bridgeSupportedNetworks (filtered by feature flag) for BUY,
  // even if the source lacks bridge support, so all destinations show (disabled when unsupported).
  // Current chain is always included for same-chain swaps.
  return {
    defaultChainId: resolvedDefaultChainId,
    chains: orderedDestinationChains,
    isLoading,
    disabledChainIds,
  }
}
