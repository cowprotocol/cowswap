import { isSupportedChainId } from '@cowprotocol/common-utils'
import { AdditionalTargetChainId, ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

import { isBridgeSourceChainSupported } from 'entities/bridgeProvider'

import { filterChainsForSelector } from './filterTokensForSelector'
import { sortChainsByDisplayOrder } from './sortChainsByDisplayOrder'

import { ChainsToSelectState } from '../types'

export interface CreateOutputChainsOptions {
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
  additionalChainIds?: Set<number>
  allowedChainIds?: number[]
}

export function computeDisabledChainIds(
  orderedChains: ChainInfo[],
  chainId: SupportedChainId,
  destinationIds: Set<number>,
  sourceSupported: boolean,
  isLoading: boolean,
): Set<number> {
  if (isLoading) return new Set()

  return new Set(
    orderedChains
      .filter((chain) => {
        if (chain.id === chainId) return false
        if (!sourceSupported) return true
        return !destinationIds.has(chain.id)
      })
      .map((c) => c.id),
  )
}

export function createInputChainsState(
  selectedTargetChainId: SupportedChainId | number,
  supportedChains: ChainInfo[],
  allowedChainIds?: number[],
): ChainsToSelectState {
  const chains = sortChainsByDisplayOrder(filterChainsForSelector(supportedChains, allowedChainIds))
  const isSelectedChainListed = !allowedChainIds || chains.some((chain) => chain.id === selectedTargetChainId)

  return {
    defaultChainId: isSelectedChainListed ? selectedTargetChainId : (chains[0]?.id ?? selectedTargetChainId),
    chains,
    isLoading: false,
  }
}

export function createOutputChainsState({
  selectedTargetChainId,
  chainId,
  currentChainInfo,
  bridgeSupportedNetworks,
  supportedChains,
  isLoading,
  routesAvailability,
  allowedChainIds,
}: CreateOutputChainsOptions): ChainsToSelectState {
  const chainSet = new Set(supportedChains.map((c) => c.id))
  const chainsWithCurrent = chainSet.has(chainId) ? supportedChains : [...supportedChains, currentChainInfo]
  const orderedChains = sortChainsByDisplayOrder(filterChainsForSelector(chainsWithCurrent, allowedChainIds))

  const destinationIds = new Set(filterDestinationChains(bridgeSupportedNetworks)?.map((c) => c.id) ?? [])
  const sourceSupported = isBridgeSourceChainSupported(chainId, filterDestinationChains(bridgeSupportedNetworks))

  const baseDisabledChainIds = computeDisabledChainIds(
    orderedChains,
    chainId,
    destinationIds,
    sourceSupported,
    isLoading,
  )

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

export function filterDestinationChains(bridgeSupportedNetworks: ChainInfo[] | undefined): ChainInfo[] | undefined {
  return bridgeSupportedNetworks?.filter((chain) => isSupportedChainId(chain.id) || chain.id in AdditionalTargetChainId)
}

export function resolveDefaultChainId(
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
  return firstEnabledChain?.id ?? orderedChains[0]?.id ?? chainId
}
