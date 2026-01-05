import { useMemo } from 'react'

import { ComposableCoW } from '@cowprotocol/cowswap-abis'
import { useSingleContractMultipleData } from '@cowprotocol/multicall'

import ms from 'ms.macro'

import { TwapOrdersAuthResult } from '../types'

const EMPTY_AUTH_RESULT = {}
const MULTICALL_OPTIONS = {}
const SWR_CONFIG = { refreshInterval: ms`30s` }

export function useTwapOrdersAuthMulticall(
  safeAddress: string,
  composableCowContract: ComposableCoW,
  pendingTwapOrderIds: string[],
): TwapOrdersAuthResult | null {
  // Use stringified key to avoid excessive multicalls
  const orderIdsKey = pendingTwapOrderIds.join(',')

  const input = useMemo(() => {
    if (!orderIdsKey) return undefined
    return orderIdsKey.split(',').map((id) => [safeAddress, id])
  }, [safeAddress, orderIdsKey])

  const { data, isLoading } = useSingleContractMultipleData<[boolean]>(
    composableCowContract,
    'singleOrders',
    input,
    MULTICALL_OPTIONS,
    SWR_CONFIG,
  )
  const loadedResults = data?.results

  return useMemo(() => {
    if (pendingTwapOrderIds.length === 0) return EMPTY_AUTH_RESULT

    if (isLoading || !loadedResults || loadedResults.length !== pendingTwapOrderIds.length) return null

    return pendingTwapOrderIds.reduce((acc, id, index) => {
      acc[id] = loadedResults[index]?.[0]
      return acc
    }, {} as TwapOrdersAuthResult)
  }, [pendingTwapOrderIds, loadedResults, isLoading])
}
