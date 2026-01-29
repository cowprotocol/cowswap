import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

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
}

export function filterDestinationChains(bridgeSupportedNetworks: ChainInfo[] | undefined): ChainInfo[] | undefined {
  return bridgeSupportedNetworks
}

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

export function createOutputChainsState({
  selectedTargetChainId,
  chainId,
  currentChainInfo,
  bridgeSupportedNetworks,
  supportedChains,
  isLoading,
  routesAvailability,
}: CreateOutputChainsOptions): ChainsToSelectState {
  const chainsById = new Map<number, ChainInfo>()

  for (const chain of supportedChains) {
    chainsById.set(chain.id, chain)
  }

  chainsById.set(currentChainInfo.id, currentChainInfo)

  for (const bridgeChain of bridgeSupportedNetworks ?? []) {
    chainsById.set(bridgeChain.id, bridgeChain)
  }

  const orderedChains = sortChainsByDisplayOrder(Array.from(chainsById.values()))

  const destinationIds = new Set(filterDestinationChains(bridgeSupportedNetworks)?.map((c) => c.id) ?? [])
  const sourceSupported = destinationIds.has(chainId)

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
