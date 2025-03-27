import { useMemo } from 'react'

import { ComposableCoW } from '@cowprotocol/abis'
import { useSingleContractMultipleData } from '@cowprotocol/multicall'

import ms from 'ms.macro'

import { TwapOrderInfo, TwapOrdersAuthResult } from '../types'

const EMPTY_AUTH_RESULT = {}
const MULTICALL_OPTIONS = {}
const SWR_CONFIG = { refreshInterval: ms`30s` }

export function useTwapOrdersAuthMulticall(
  safeAddress: string,
  composableCowContract: ComposableCoW,
  ordersInfo: TwapOrderInfo[]
): TwapOrdersAuthResult | null {
  const input = useMemo(() => {
    return ordersInfo.map(({ id }) => [safeAddress, id])
  }, [safeAddress, ordersInfo])

  const { data: loadedResults, isLoading } = useSingleContractMultipleData<[boolean]>(
    composableCowContract,
    'singleOrders',
    input,
    MULTICALL_OPTIONS,
    SWR_CONFIG
  )

  return useMemo(() => {
    if (ordersInfo.length === 0) return EMPTY_AUTH_RESULT

    if (isLoading || !loadedResults || loadedResults.length !== ordersInfo.length) return null

    return ordersInfo.reduce((acc, val, index) => {
      acc[val.id] = loadedResults[index]?.[0]
      return acc
    }, {} as TwapOrdersAuthResult)
  }, [ordersInfo, loadedResults, isLoading])
}
