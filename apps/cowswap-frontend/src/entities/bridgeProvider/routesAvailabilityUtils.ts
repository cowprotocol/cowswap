import { ChainId, SupportedChainId } from '@cowprotocol/cow-sdk'

import { bridgingSdk } from 'tradingSdk/bridgingSdk'

export interface RoutesAvailabilityResult {
  unavailableChainIds: Set<ChainId>
  loadingChainIds: Set<ChainId>
  isLoading: boolean
}

export interface RouteCheckResult {
  chainId: ChainId
  isAvailable: boolean
}

export const EMPTY_ROUTES_RESULT: RoutesAvailabilityResult = {
  unavailableChainIds: new Set(),
  loadingChainIds: new Set(),
  isLoading: false,
}

export function filterDestinationChains(destinationChainIds: ChainId[], sourceChainId: number | undefined): ChainId[] {
  return destinationChainIds.filter((id) => id !== sourceChainId)
}

export type RoutesAvailabilityKey = [SupportedChainId, string, string, string]

export interface RoutesAvailabilityKeyParams {
  isBridgingEnabled: boolean
  sourceChainId: SupportedChainId | undefined
  chainsToCheck: ChainId[]
  providersKey: string
}

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

const chainComparator = (a: ChainId, b: ChainId): number => {
  const aIsNum = typeof a === 'number'
  const bIsNum = typeof b === 'number'

  if (typeof a === 'string' && typeof b === 'string') {
    return collator.compare(a, b)
  }

  if (aIsNum && bIsNum) return a - b
  if (aIsNum && !bIsNum) return -1 // numbers first

  return 1
}

export function createAvailabilitySwrKey(params: RoutesAvailabilityKeyParams): RoutesAvailabilityKey | null {
  const { isBridgingEnabled, sourceChainId, chainsToCheck, providersKey } = params

  if (!isBridgingEnabled || !sourceChainId || chainsToCheck.length === 0) {
    return null
  }

  return [sourceChainId, chainsToCheck.slice().sort(chainComparator).join(','), providersKey, 'routesAvailability']
}

export async function fetchRoutesAvailability(key: RoutesAvailabilityKey): Promise<RouteCheckResult[]> {
  const [sellChainId, chainIdsString] = key
  const chainIds = chainIdsString.split(',').map(Number)

  return Promise.all(chainIds.map((buyChainId) => checkSingleRouteAvailability(sellChainId, buyChainId)))
}

async function checkSingleRouteAvailability(
  sellChainId: SupportedChainId,
  buyChainId: number,
): Promise<RouteCheckResult> {
  try {
    const result = await bridgingSdk.getBuyTokens({ sellChainId, buyChainId })
    const isAvailable = result.tokens.length > 0 && result.isRouteAvailable

    return { chainId: buyChainId, isAvailable }
  } catch (error) {
    console.warn(`[routesAvailability] Failed to check route ${sellChainId} -> ${buyChainId}`, error)

    return { chainId: buyChainId, isAvailable: false }
  }
}

export interface BuildResultParams {
  swrKey: RoutesAvailabilityKey | null
  isLoading: boolean
  data: RouteCheckResult[] | undefined
  chainsToCheck: ChainId[]
}

export function buildRoutesAvailabilityResult(params: BuildResultParams): RoutesAvailabilityResult {
  const { swrKey, isLoading, data, chainsToCheck } = params

  if (!swrKey) {
    return EMPTY_ROUTES_RESULT
  }

  if (isLoading || !data) {
    return {
      unavailableChainIds: new Set(),
      loadingChainIds: new Set(chainsToCheck),
      isLoading: true,
    }
  }

  const unavailableChainIds = new Set<ChainId>(
    data.filter((result) => !result.isAvailable).map((result) => result.chainId),
  )

  return {
    unavailableChainIds,
    loadingChainIds: new Set(),
    isLoading: false,
  }
}
