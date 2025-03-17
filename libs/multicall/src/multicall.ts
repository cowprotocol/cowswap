import type { Multicall3 } from '@cowprotocol/abis'
import type { JsonRpcProvider } from '@ethersproject/providers'

import { DEFAULT_BATCH_SIZE } from './const'
import { getMulticallContract } from './utils/getMulticallContract'

export interface MultiCallOptions {
  batchSize?: number
  consequentExecution?: boolean
}

/**
 * TODO: return results just after batch execution
 * TODO: add fallback for failed calls
 * TODO: add providers fallback
 */
export async function multiCall(
  provider: JsonRpcProvider,
  calls: Multicall3.CallStruct[],
  options: MultiCallOptions = {},
): Promise<Multicall3.ResultStructOutput[]> {
  const { batchSize = DEFAULT_BATCH_SIZE, consequentExecution } = options

  const multicall = getMulticallContract(provider)

  const batches = splitIntoBatches(calls, batchSize)

  return consequentExecution
    ? batches
        .reduce<Promise<Multicall3.ResultStructOutput[][]>>((acc, batch) => {
          return acc.then((results) => {
            return multicall.callStatic.tryAggregate(false, batch).then((batchResults) => {
              results.push(batchResults)

              return results
            })
          })
        }, Promise.resolve([]))
        .then((results) => results.flat())
    : Promise.all(
        batches.map((batch) => {
          return multicall.callStatic.tryAggregate(false, batch)
        }),
      ).then((res) => res.flat())
}

function splitIntoBatches(calls: Multicall3.CallStruct[], batchSize: number): Multicall3.CallStruct[][] {
  const results: Multicall3.CallStruct[][] = []

  for (let i = 0; i < calls.length; i += batchSize) {
    const batch = calls.slice(i, i + batchSize)

    results.push(batch)
  }

  return results
}
