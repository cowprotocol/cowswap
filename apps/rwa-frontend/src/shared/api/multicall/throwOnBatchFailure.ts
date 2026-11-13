import { ContractFunctionExecutionError } from 'viem'

/**
 * Throws when a whole multicall batch failed (RPC down, timeout). viem reports that as a `failure` of every call in
 * the batch, the same status as a single token's revert, and only the error of the failed `aggregate3` call tells
 * them apart
 */
export function throwOnBatchFailure(responses: readonly { error?: Error }[]): void {
  const batchError = responses.find(({ error }) => isBatchFailure(error))?.error

  if (batchError) throw batchError
}

function isBatchFailure(error: Error | undefined): boolean {
  return error instanceof ContractFunctionExecutionError && error.functionName === 'aggregate3'
}
