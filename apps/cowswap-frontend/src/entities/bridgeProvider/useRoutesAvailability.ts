import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { isNonEvmPrototypeEnabled } from 'prototype/nonEvmPrototype'
import useSWR from 'swr'

import { isNonEvmChainId } from 'common/chains/nonEvm'

import {
  buildRoutesAvailabilityResult,
  createAvailabilitySwrKey,
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
  const isPrototypeEnabled = isNonEvmPrototypeEnabled()
  const providerIds = useBridgeProvidersIds()
  const providersKey = providerIds.join('|')

  const chainsToCheck = useMemo(
    () => filterDestinationChains(destinationChainIds, sourceChainId),
    [destinationChainIds, sourceChainId],
  )

  const { chainsToCheckForFetch } = useMemo(() => {
    if (!isPrototypeEnabled) {
      return { chainsToCheckForFetch: chainsToCheck }
    }

    const filtered = chainsToCheck.filter((chainId) => !isNonEvmChainId(chainId))

    return { chainsToCheckForFetch: filtered }
  }, [chainsToCheck, isPrototypeEnabled])

  const swrKey = useMemo(
    () =>
      createAvailabilitySwrKey({
        isBridgingEnabled,
        sourceChainId,
        chainsToCheck: chainsToCheckForFetch,
        providersKey,
      }),
    [isBridgingEnabled, sourceChainId, chainsToCheckForFetch, providersKey],
  )

  const { data, isLoading } = useSWR<RouteCheckResult[], Error, RoutesAvailabilityKey | null>(
    swrKey,
    fetchRoutesAvailability,
    SWR_NO_REFRESH_OPTIONS,
  )

  return useMemo(
    () =>
      buildRoutesAvailabilityResult({
        swrKey,
        isLoading,
        data,
        chainsToCheck: chainsToCheckForFetch,
      }),
    [swrKey, isLoading, data, chainsToCheckForFetch],
  )
}
