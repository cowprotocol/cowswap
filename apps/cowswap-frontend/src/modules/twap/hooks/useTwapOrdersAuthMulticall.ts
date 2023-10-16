import { useMemo } from 'react'

import { ComposableCoW } from '@cowprotocol/abis'
import { ListenerOptionsWithGas } from '@uniswap/redux-multicall'

import { useSingleContractMultipleData } from 'lib/hooks/multicall'

import { TwapOrderInfo, TwapOrdersAuthResult } from '../types'

const DEFAULT_LISTENER_OPTIONS: ListenerOptionsWithGas = { gasRequired: 185_000, blocksPerFetch: 5 }

export function useTwapOrdersAuthMulticall(
  safeAddress: string,
  composableCowContract: ComposableCoW,
  ordersInfo: TwapOrderInfo[]
): TwapOrdersAuthResult | null {
  const input = useMemo(() => {
    return ordersInfo.map(({ id }) => [safeAddress, id])
  }, [safeAddress, ordersInfo])

  const results = useSingleContractMultipleData(composableCowContract, 'singleOrders', input, DEFAULT_LISTENER_OPTIONS)

  return useMemo(() => {
    const loadedResults = results.filter((result) => !result.loading && result.valid)

    if (loadedResults.length !== ordersInfo.length) return null

    return ordersInfo.reduce((acc, val, index) => {
      acc[val.id] = loadedResults[index].result?.[0]
      return acc
    }, {} as TwapOrdersAuthResult)
  }, [ordersInfo, results])
}
