import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { SupportedChainId, ChainInfo } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import { Field } from 'legacy/state/types'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

import { ChainsToSelectState } from '../types'
import { mapChainInfo } from '../utils/mapChainInfo'

const SUPPORTED_CHAINS: ChainInfo[] = Object.keys(CHAIN_INFO).map((chainId) => {
  const supportedChainId = +chainId as SupportedChainId
  const info = CHAIN_INFO[supportedChainId]

  return mapChainInfo(supportedChainId, info)
})

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
  const isBridgingEnabled = useIsBridgingEnabled()

  return useMemo(() => {
    if (!field || !isBridgingEnabled) return undefined

    const currentChainInfo = mapChainInfo(chainId, CHAIN_INFO[chainId])
    const isSourceChainSupportedByBridge = Boolean(
      bridgeSupportedNetworks?.find((bridgeChain) => bridgeChain.id === chainId),
    )

    // For the sell token selector we only display supported chains
    if (field === Field.INPUT) {
      return {
        defaultChainId: selectedTargetChainId,
        chains: SUPPORTED_CHAINS,
        isLoading: false,
      }
    }

    /**
     * When the source chain is not supported by bridge provider
     * We act as non-bridge mode
     */
    if (!isSourceChainSupportedByBridge) {
      return {
        defaultChainId: selectedTargetChainId,
        chains: [],
        isLoading: false,
      }
    }

    return {
      defaultChainId: selectedTargetChainId,
      // Add the source network to the list if it's not supported by bridge provider
      chains: [...(isSourceChainSupportedByBridge ? [] : [currentChainInfo]), ...(bridgeSupportedNetworks || [])],
      isLoading,
    }
  }, [field, selectedTargetChainId, chainId, bridgeSupportedNetworks, isLoading, isBridgingEnabled])
}
