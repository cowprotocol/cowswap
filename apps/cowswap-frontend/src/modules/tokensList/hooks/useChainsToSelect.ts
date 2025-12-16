import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useAvailableChains, useFeatureFlags, useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import { Field } from 'legacy/state/types'

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
  const { field, selectedTargetChainId = chainId, isAdvancedTradeType } = useSelectTokenWidgetState()
  const { data: bridgeSupportedNetworks, isLoading } = useBridgeSupportedNetworks()
  const { areUnsupportedChainsEnabled } = useFeatureFlags()
  const isBridgingEnabled = useIsBridgingEnabled()
  const availableChains = useAvailableChains()

  const supportedChains = useMemo(() => {
    return availableChains.reduce((acc, id) => {
      const info = CHAIN_INFO[id]

      if (info) {
        acc.push(mapChainInfo(id, info))
      }

      return acc
    }, [] as ChainInfo[])
  }, [availableChains])

  return useMemo(() => {
    if (!field || !chainId) return undefined

    const chainInfo = CHAIN_INFO[chainId]
    if (!chainInfo) return undefined

    const currentChainInfo = mapChainInfo(chainId, chainInfo)
    // Limit/TWAP buys must stay on the wallet chain, so skip bridge wiring entirely.
    // TODO: Revisit when SC wallet bridging supports advanced trades, so TWAPs can bridge.
    const shouldForceSingleChain = isAdvancedTradeType && field === Field.OUTPUT

    if (!isBridgingEnabled && !shouldForceSingleChain) return undefined

    if (shouldForceSingleChain) {
      return createSingleChainState(chainId, currentChainInfo)
    }

    if (field === Field.INPUT) {
      return createInputChainsState(selectedTargetChainId, supportedChains)
    }

    return createOutputChainsState({
      selectedTargetChainId,
      chainId,
      currentChainInfo,
      bridgeSupportedNetworks,
      areUnsupportedChainsEnabled,
      isLoading,
    })
  }, [
    field,
    selectedTargetChainId,
    chainId,
    bridgeSupportedNetworks,
    isLoading,
    isBridgingEnabled,
    areUnsupportedChainsEnabled,
    supportedChains,
    isAdvancedTradeType,
  ])
}

function filterDestinationChains(
  bridgeSupportedNetworks: ChainInfo[] | undefined,
  areUnsupportedChainsEnabled: boolean | undefined,
): ChainInfo[] | undefined {
  if (areUnsupportedChainsEnabled) {
    // Nothing to filter, we return all bridge supported networks
    return bridgeSupportedNetworks
  } else {
    // If unsupported chains are not enabled, we only return the supported networks
    return bridgeSupportedNetworks?.filter((chain) => chain.id in SupportedChainId)
  }
}

// Represents the “non-bridge” UX (bridging disabled or advanced-trade guardrail) where only the current chain is available.
function createSingleChainState(
  defaultChainId: SupportedChainId | number,
  chain: ChainInfo,
  isLoading = false,
): ChainsToSelectState {
  return {
    defaultChainId,
    chains: [chain],
    isLoading,
  }
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
  areUnsupportedChainsEnabled: boolean | undefined
  isLoading: boolean
}

export function createOutputChainsState({
  selectedTargetChainId,
  chainId,
  currentChainInfo,
  bridgeSupportedNetworks,
  areUnsupportedChainsEnabled,
  isLoading,
}: CreateOutputChainsOptions): ChainsToSelectState {
  const destinationChains = filterDestinationChains(bridgeSupportedNetworks, areUnsupportedChainsEnabled) ?? []
  const orderedDestinationChains = sortChainsByDisplayOrder(destinationChains)
  const isSourceChainSupportedByBridge = Boolean(
    bridgeSupportedNetworks?.some((bridgeChain) => bridgeChain.id === chainId),
  )

  if (!isSourceChainSupportedByBridge) {
    // Source chain is unsupported by the bridge provider; fall back to non-bridge behavior.
    return createSingleChainState(selectedTargetChainId, currentChainInfo)
  }

  return {
    defaultChainId: selectedTargetChainId,
    // Bridge supports this chain, so expose the provider-supplied destinations.
    chains: orderedDestinationChains,
    isLoading,
  }
}
