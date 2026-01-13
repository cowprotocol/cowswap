import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import {
  buildRoutesAvailabilityResult,
  createRoutesAvailabilityKey,
  fetchRoutesAvailability,
  filterDestinationChains,
  RouteCheckResult,
  RoutesAvailabilityKey,
  RoutesAvailabilityResult,
} from './routesAvailabilityUtils'
import { useBridgeProvidersIds } from './useBridgeProvidersIds'

export type { RoutesAvailabilityResult } from './routesAvailabilityUtils'

/**
 * Pre-checks route availability for multiple destination chains from a source chain.
 * Returns which chains have unavailable routes and which are still loading.
 */
export function useRoutesAvailability(
  sourceChainId: SupportedChainId | undefined,
  destinationChainIds: number[],
): RoutesAvailabilityResult {
  const isBridgingEnabled = useIsBridgingEnabled()
  const providerIds = useBridgeProvidersIds()
  const providersKey = providerIds.join('|')

  const chainsToCheck = useMemo(
    () => filterDestinationChains(destinationChainIds, sourceChainId),
    [destinationChainIds, sourceChainId],
  )

  const swrKey = useMemo(
    () => createRoutesAvailabilityKey({ isBridgingEnabled, sourceChainId, chainsToCheck, providersKey }),
    [isBridgingEnabled, sourceChainId, chainsToCheck, providersKey],
  )

  const { data, isLoading } = useSWR<RouteCheckResult[], Error, RoutesAvailabilityKey | null>(
    swrKey,
    fetchRoutesAvailability,
    SWR_NO_REFRESH_OPTIONS,
  )

  return useMemo(
    () => buildRoutesAvailabilityResult({ swrKey, isLoading, data, chainsToCheck }),
    [swrKey, isLoading, data, chainsToCheck],
  )
}
