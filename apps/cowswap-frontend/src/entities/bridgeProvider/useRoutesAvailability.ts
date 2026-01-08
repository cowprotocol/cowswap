import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { useBridgeProvidersIds } from './useBridgeProvidersIds'

export interface RoutesAvailabilityResult {
  unavailableChainIds: Set<number>
  loadingChainIds: Set<number>
  isLoading: boolean
}

const EMPTY_RESULT: RoutesAvailabilityResult = {
  unavailableChainIds: new Set(),
  loadingChainIds: new Set(),
  isLoading: false,
}

interface RouteCheckResult {
  chainId: number
  isAvailable: boolean
}

/**
 * Pre-checks route availability for multiple destination chains from a source chain.
 * Returns which chains have unavailable routes and which are still loading.
 *
 * Note: Fires parallel requests for all destination chains without throttling.
 * This is acceptable because:
 * - SWR caches results, so repeated opens don't re-fetch
 * - Chain count is limited (~10-15 max)
 * - Requests are lightweight (token existence checks)
 * If this becomes a bottleneck, consider batching or sequential fetching.
 */
export function useRoutesAvailability(
  sourceChainId: SupportedChainId | undefined,
  destinationChainIds: number[],
): RoutesAvailabilityResult {
  const isBridgingEnabled = useIsBridgingEnabled()
  const providerIds = useBridgeProvidersIds()
  const providersKey = providerIds.join('|')

  // Filter out the source chain (same-chain swaps are always available)
  const chainsToCheck = useMemo(
    () => destinationChainIds.filter((id) => id !== sourceChainId),
    [destinationChainIds, sourceChainId],
  )

  // Create a stable key for the SWR request
  const swrKey = useMemo(() => {
    if (!isBridgingEnabled || !sourceChainId || chainsToCheck.length === 0) {
      return null
    }
    return [sourceChainId, chainsToCheck.sort((a, b) => a - b).join(','), providersKey, 'useRoutesAvailability']
  }, [isBridgingEnabled, sourceChainId, chainsToCheck, providersKey])

  const { data, isLoading } = useSWR<RouteCheckResult[]>(
    swrKey,
    async (key) => {
      const [sellChainId, chainIdsString] = key as [SupportedChainId, string, string, string]
      const chainIds = chainIdsString.split(',').map(Number)

      // Check routes in parallel for all destination chains
      const results = await Promise.all(
        chainIds.map(async (buyChainId: number): Promise<RouteCheckResult> => {
          try {
            const result = await bridgingSdk.getBuyTokens({ sellChainId, buyChainId })
            const isAvailable = result.tokens.length > 0 && result.isRouteAvailable
            return { chainId: buyChainId, isAvailable }
          } catch (error) {
            console.warn(`[useRoutesAvailability] Failed to check route ${sellChainId} -> ${buyChainId}`, error)
            // Treat errors as unavailable routes
            return { chainId: buyChainId, isAvailable: false }
          }
        }),
      )

      return results
    },
    SWR_NO_REFRESH_OPTIONS,
  )

  return useMemo(() => {
    if (!swrKey) {
      return EMPTY_RESULT
    }

    if (isLoading || !data) {
      // While loading, mark all chains being checked as loading
      return {
        unavailableChainIds: new Set(),
        loadingChainIds: new Set(chainsToCheck),
        isLoading: true,
      }
    }

    const unavailableChainIds = new Set<number>(
      data.filter((result) => !result.isAvailable).map((result) => result.chainId),
    )

    return {
      unavailableChainIds,
      loadingChainIds: new Set(),
      isLoading: false,
    }
  }, [swrKey, isLoading, data, chainsToCheck])
}
