import { Multicall3 } from '@cowprotocol/abis'
import type { Web3Provider } from '@ethersproject/providers'

import { DEFAULT_BATCH_SIZE } from './const'
import { getMulticallContract } from './utils/getMulticallContract'

export interface MulticallOptions {
  batchSize?: number
  refreshInterval?: number
}

export async function multicall(
  provider: Web3Provider,
  calls: Multicall3.CallStruct[],
  options: MulticallOptions = {}
): Promise<Multicall3.ResultStructOutput[]> {
  const { batchSize = DEFAULT_BATCH_SIZE } = options

  const multicall = getMulticallContract(provider)

  const batches = calls.reduce<Multicall3.CallStruct[][]>((acc, call, index) => {
    const batchIndex = Math.floor(index / batchSize)

    if (!acc[batchIndex]) acc[batchIndex] = []

    acc[batchIndex].push(call)
    return acc
  }, [])

  const requests = batches.map((batch) => {
    return multicall.callStatic.tryAggregate(false, batch)
  })

  return (await Promise.all(requests)).flat()
}
