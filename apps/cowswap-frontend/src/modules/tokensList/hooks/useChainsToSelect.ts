import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useAvailableChains, useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedNetworks, useRoutesAvailability } from 'entities/bridgeProvider'

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
 * For the buy token we return all app-supported chains with disabled state for non-bridgeable targets.
 *
 * Note: `isBridgingEnabled` reads from a Jotai atom, controlled by BridgingEnabledUpdater
 * based on runtime checks (swap route + wallet compatibility).
 */
export function useChainsToSelect(): ChainsToSelectState | undefined {
  const { chainId } = useWalletInfo()
  const { field, selectedTargetChainId = chainId, tradeType } = useSelectTokenWidgetState()
  const { data: bridgeSupportedNetworks, isLoading } = useBridgeSupportedNetworks()
  const isBridgingEnabled = useIsBridgingEnabled() // Reads from Jotai atom
  const availableChains = useAvailableChains()
  const isAdvancedTradeType = tradeType === TradeType.LIMIT_ORDER || tradeType === TradeType.ADVANCED_ORDERS

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
      return createInputChainsState(selectedTargetChainId, supportedChains)
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
  supportedChains: ChainInfo[]
  isLoading: boolean
  routesAvailability: {
    unavailableChainIds: Set<number>
    loadingChainIds: Set<number>
    isLoading: boolean
  }
}

function computeDisabledChainIds(
  orderedChains: ChainInfo[],
  chainId: SupportedChainId,
  destinationIds: Set<number>,
  sourceSupported: boolean,
  isLoading: boolean,
): Set<number> {
  // During loading, don't apply disabled states - wait for bridge data
  if (isLoading) return new Set()

  return new Set(
    orderedChains
      .filter((chain) => {
        if (chain.id === chainId) return false // Source always enabled
        if (!sourceSupported) return true // All disabled when source not supported
        return !destinationIds.has(chain.id) // Disable if not a valid bridge destination
      })
      .map((c) => c.id),
  )
}

function resolveDefaultChainId(
  orderedChains: ChainInfo[],
  selectedTargetChainId: number,
  chainId: SupportedChainId,
  disabledChainIds: Set<number>,
): number {
  const isSelectedTargetValid =
    orderedChains.some((c) => c.id === selectedTargetChainId) && !disabledChainIds.has(selectedTargetChainId)
  if (isSelectedTargetValid) return selectedTargetChainId

  const sourceInList = orderedChains.some((c) => c.id === chainId)
  if (sourceInList) return chainId

  const firstEnabledChain = orderedChains.find((c) => !disabledChainIds.has(c.id))
  return firstEnabledChain?.id ?? orderedChains[0]?.id
}

export function createOutputChainsState({
  selectedTargetChainId,
  chainId,
  currentChainInfo,
  bridgeSupportedNetworks,
  supportedChains,
  isLoading,
  routesAvailability,
}: CreateOutputChainsOptions): ChainsToSelectState {
  // Use all app-supported chains as the base list (consistent with SELL selector)
  // Always include the current chain for same-chain swaps, even if feature-flagged off
  const chainSet = new Set(supportedChains.map((c) => c.id))
  const chainsWithCurrent = chainSet.has(chainId) ? supportedChains : [...supportedChains, currentChainInfo]
  const orderedChains = sortChainsByDisplayOrder(chainsWithCurrent)

  const destinationIds = new Set(filterDestinationChains(bridgeSupportedNetworks)?.map((c) => c.id) ?? [])
  const sourceSupported = destinationIds.has(chainId)

  // Compute base disabled chains from bridge network data
  const baseDisabledChainIds = computeDisabledChainIds(
    orderedChains,
    chainId,
    destinationIds,
    sourceSupported,
    isLoading,
  )

  // Merge with unavailable routes from pre-check (chains with no valid route)
  const disabledChainIds = new Set([...baseDisabledChainIds, ...routesAvailability.unavailableChainIds])

  const resolvedDefaultChainId = resolveDefaultChainId(orderedChains, selectedTargetChainId, chainId, disabledChainIds)

  return {
    defaultChainId: resolvedDefaultChainId,
    chains: orderedChains,
    isLoading,
    disabledChainIds: disabledChainIds.size > 0 ? disabledChainIds : undefined,
    loadingChainIds: routesAvailability.loadingChainIds.size > 0 ? routesAvailability.loadingChainIds : undefined,
  }
}
