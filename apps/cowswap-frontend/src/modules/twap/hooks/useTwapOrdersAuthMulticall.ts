import { useMemo } from 'react'

import { useReadContracts } from 'wagmi'

import { ComposableCowContractData } from 'modules/advancedOrders/hooks/useComposableCowContract'

import { TwapOrdersAuthResult } from '../types'

import type { Hex } from 'viem'

const EMPTY_AUTH_RESULT = {}

export function useTwapOrdersAuthMulticall(
  safeAddress: string,
  composableCowContract: ComposableCowContractData,
  pendingTwapOrderIds: string[],
): TwapOrdersAuthResult | null {
  // Use stringified key to avoid excessive multicalls
  const orderIdsKey = pendingTwapOrderIds.join(',')

  const input = useMemo(() => {
    if (!orderIdsKey) return undefined
    return orderIdsKey.split(',').map((id) => [safeAddress, id] as [string, Hex])
  }, [safeAddress, orderIdsKey])

  const { data, isLoading } = useReadContracts({
    contracts: input!.map((args) => ({
      abi: composableCowContract.abi,
      address: composableCowContract.address,
      functionName: 'singleOrders' as const,
      args,
    })),
    query: { enabled: !!input },
  })

  return useMemo(() => {
    if (pendingTwapOrderIds.length === 0) return EMPTY_AUTH_RESULT

    if (isLoading || !data || data.length !== pendingTwapOrderIds.length) return null

    return pendingTwapOrderIds.reduce((acc, id, index) => {
      acc[id] = data[index]?.result
      return acc
    }, {} as TwapOrdersAuthResult)
  }, [pendingTwapOrderIds, data, isLoading])
}
