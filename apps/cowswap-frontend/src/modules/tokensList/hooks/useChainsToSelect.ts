import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useAvailableChains, useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedNetworks, useRoutesAvailability } from 'entities/bridgeProvider'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade/types'

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
  const { field, selectedTargetChainId = chainId, tradeType } = useSelectTokenWidgetState()
  const { data: bridgeSupportedNetworks, isLoading } = useBridgeSupportedNetworks()
  const isBridgingEnabled = useIsBridgingEnabled() // Reads from Jotai atom
  const availableChains = useAvailableChains()
  const isAdvancedTradeType = tradeType === TradeType.LIMIT_ORDER || tradeType === TradeType.ADVANCED_ORDERS
  const shouldHideNetworkSelector = useShouldHideNetworkSelector()

  const supportedChains = useMemo(() => {
    return availableChains.reduce((acc, id) => {
      const info = CHAIN_INFO[id]
      if (info) acc.push(mapChainInfo(id, info))
      return acc
    }, [] as ChainInfo[])
  }, [availableChains])

  const destinationChainIds = useMemo(() => supportedChains.map((c) => c.id), [supportedChains])
  const isBuyField = field === Field.OUTPUT
  const routesAvailability = useRoutesAvailability(
    isBuyField && isBridgingEnabled ? chainId : undefined,
    destinationChainIds,
  )

  return useMemo(() => {
    // TODO: Limit/TWAP orders currently disable chain selection; revisit when SC wallet bridging supports advanced trades.
    if (!field || !chainId || !isBridgingEnabled || isAdvancedTradeType) return undefined

    const chainInfo = CHAIN_INFO[chainId]
    if (!chainInfo) return undefined

    if (field === Field.INPUT) {
      return {
        defaultChainId: selectedTargetChainId,
        chains: shouldHideNetworkSelector ? [] : sortChainsByDisplayOrder(supportedChains),
        isLoading: false,
      }
    }

    // BUY token selection - include disabled chains info
    return createOutputChainsState({
      selectedTargetChainId,
      chainId,
      currentChainInfo: mapChainInfo(chainId, chainInfo),
      bridgeSupportedNetworks,
      supportedChains,
      isLoading,
      routesAvailability,
    })
  }, [
    field,
    selectedTargetChainId,
    chainId,
    bridgeSupportedNetworks,
    supportedChains,
    isLoading,
    isBridgingEnabled,
    isAdvancedTradeType,
    routesAvailability,
    shouldHideNetworkSelector,
  ])
}
