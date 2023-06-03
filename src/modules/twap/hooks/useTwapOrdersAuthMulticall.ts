import { useMemo } from 'react'

import { ListenerOptionsWithGas } from '@uniswap/redux-multicall'

import { ComposableCoW } from 'abis/types/ComposableCoW'
import { useSingleContractMultipleData } from 'lib/hooks/multicall'

const DEFAULT_LISTENER_OPTIONS: ListenerOptionsWithGas = { gasRequired: 185_000, blocksPerFetch: 5 }

export function useTwapOrdersAuthMulticall(
  safeAddress: string,
  composableCowContract: ComposableCoW,
  ordersHashes: string[]
): (boolean | undefined)[] {
  const input = useMemo(() => {
    return ordersHashes.map((hash) => [safeAddress, hash])
  }, [safeAddress, ordersHashes])

  const results = useSingleContractMultipleData(composableCowContract, 'singleOrders', input, DEFAULT_LISTENER_OPTIONS)

  return useMemo(() => {
    return results.map((res) => res.result?.[0] as boolean | undefined)
  }, [results])
}
