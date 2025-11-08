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

/**
 * Returns an array of chains to select in the token selector widget.
 * The array depends on sell/buy token selection.
 * For the sell token we return all supported chains.
 * For the buy token we return current network + all bridge target networks.
 */
export function useChainsToSelect(): ChainsToSelectState | undefined {
  const { chainId } = useWalletInfo()
  const { field, selectedTargetChainId = chainId } = useSelectTokenWidgetState()
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
    if (!field || !isBridgingEnabled) return undefined

    const chainInfo = CHAIN_INFO[chainId]
    if (!chainInfo) return undefined

    const currentChainInfo = mapChainInfo(chainId, chainInfo)
    const isSourceChainSupportedByBridge = Boolean(
      bridgeSupportedNetworks?.find((bridgeChain) => bridgeChain.id === chainId),
    )

    // For the sell token selector we only display supported chains
    if (field === Field.INPUT) {
      // Sell side can only pick among wallet-supported chains
      return {
        defaultChainId: selectedTargetChainId,
        chains: supportedChains,
        isLoading: false,
      }
    }

    const destinationChains = filterDestinationChains(bridgeSupportedNetworks, areUnsupportedChainsEnabled) ?? []

    /**
     * When the source chain is not supported by bridge provider
     * We act as non-bridge mode
     */
    if (!isSourceChainSupportedByBridge) {
      return {
        defaultChainId: selectedTargetChainId,
        chains: [currentChainInfo],
        isLoading: false,
      }
    }

    return {
      defaultChainId: selectedTargetChainId,
      // Bridge supports this chain, so show the destinations reported by the provider
      chains: destinationChains,
      isLoading,
    }
  }, [
    field,
    selectedTargetChainId,
    chainId,
    bridgeSupportedNetworks,
    isLoading,
    isBridgingEnabled,
    areUnsupportedChainsEnabled,
    supportedChains,
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
