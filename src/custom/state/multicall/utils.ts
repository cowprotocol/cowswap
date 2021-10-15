import { Contract } from '@ethersproject/contracts'

import { Call } from '@src/state/multicall/utils'

import { ListenerOptions } from 'state/multicall/actions'
import { CallResult, isValidMethodArgs, OptionalMethodInputs, Result, toCallState } from 'state/multicall/hooks'
import { fetchChunk } from 'state/multicall/updater'
import { UniswapInterfaceMulticall } from '@src/types/v3'

export type CallParams = {
  contract: Contract | null | undefined
  methodName: string
  inputs?: OptionalMethodInputs
  gasRequired?: number
}

export type GetSingleCallParams = CallParams & {
  multicall2Contract: UniswapInterfaceMulticall
  options?: ListenerOptions
  latestBlockNumber?: number
}

export type GetMultipleCallsParams = Omit<GetSingleCallParams, 'contract' | 'methodName' | 'inputs' | 'gasRequired'> & {
  callsParams: CallParams[]
}

type CreateCallParams = CallParams
type ExecuteCallsParams = Pick<GetSingleCallParams, 'options' | 'multicall2Contract' | 'latestBlockNumber'> & {
  calls: (Call | null)[]
}

type ExecuteCallsResponse = {
  results: { success: boolean; returnData: string }[]
  blockNumber: number
}

function createCall({ contract, methodName, inputs, gasRequired }: CreateCallParams): Call | null {
  const fragment = contract?.interface?.getFunction(methodName)

  if (!contract || !fragment || !isValidMethodArgs(inputs)) {
    console.warn(`createCall::no contract or fragment or not valid`, !contract, !fragment, !isValidMethodArgs(inputs))
    return null
  }

  return {
    address: contract.address,
    callData: contract.interface.encodeFunctionData(fragment, inputs),
    ...(gasRequired ? { gasRequired } : {}),
  }
}

async function executeCalls({
  calls,
  multicall2Contract,
  latestBlockNumber,
}: ExecuteCallsParams): Promise<ExecuteCallsResponse | null> {
  if (!multicall2Contract || calls.length === 0) {
    console.warn(`executeCalls::no multicall or no calls`, !multicall2Contract, calls.length)
    return null
  }

  // Keep track of position of non-null Calls
  const validCallsOriginalIds: Record<number, number> = {}
  // Also create a list only with valid calls
  const validCalls: Call[] = []

  calls.forEach((call, index) => {
    if (call) {
      validCallsOriginalIds[index] = validCalls.length
      validCalls.push(call)
    }
  })

  if (validCalls.length === 0) {
    console.warn(`executeCalls:no valid calls to execute`)
    return null
  }

  try {
    const blockNumber = latestBlockNumber || 1

    const results = await fetchChunk(multicall2Contract, validCalls, blockNumber)
    // Return results in same order as received
    const fixedResults = calls.map((call, index) =>
      !call ? { success: false, returnData: '' } : results[validCallsOriginalIds[index]]
    )

    return { results: fixedResults, blockNumber }
  } catch (e) {
    console.error(`Failed to execute calls`, calls, e)
    return null
  }
}

/**
 * Non-hook version of useSingleCallResult
 *
 * Based on /src/state/multicall/hooks.ts > useSingleCallResult
 *
 * All types and intermediate steps are based on the original hooks
 * This was kept as close as possible to original.
 * Probably not all steps/types make sense for our use-case but changing them
 * might require changing the base multicall implementation.
 */
export async function getSingleCallResult(params: GetSingleCallParams) {
  const { contract, methodName } = params
  const fragment = contract?.interface?.getFunction(methodName)

  const call = createCall(params)

  if (!call) {
    console.warn(`getSingleCallResult::no call`)
    return null
  }

  const callResults = await executeCalls({ calls: [call], ...params })

  if (!callResults) {
    console.warn(`getSingleCallResult::no call results`)
    return null
  }

  const {
    results: [{ success, returnData }],
    blockNumber,
  } = callResults

  if (!success || returnData === '0x') {
    console.warn(`getSingleCallResult::no success of return data`, success, returnData)
    return null
  }

  // TODO: we might move away from this type, only here for now
  const callResult: CallResult = { valid: true, data: returnData, blockNumber }

  console.warn(`getSingleCallResult::callResult`, callResult)

  const callState = toCallState(callResult, contract?.interface, fragment, blockNumber)

  if (!callState) {
    console.warn(`getSingleCallResult::no callState`)
    return null
  }

  console.warn(`getSingleCallResult::callState`, callState)

  const { valid, error, result } = callState

  if (!valid || error) {
    console.warn(`getSingleCallResult::not valid or error`, valid, error)
    return null
  }

  return result
}

type ExtractResultsParams = Omit<ExecuteCallsResponse, 'results'> & {
  results: (ExecuteCallsResponse['results'][0] & CallParams)[]
}

function extractResults(params: ExtractResultsParams) {
  const { results, blockNumber } = params

  return results.map((_result) => {
    const { success, returnData, contract, methodName } = _result
    const fragment = contract?.interface?.getFunction(methodName)

    if (!success || returnData === '0x' || !contract || !fragment) {
      console.warn(`extractResults::invalid params`, !success, returnData === '0x', !contract, !fragment)
      return null
    }

    const callResult: CallResult = { valid: true, data: returnData, blockNumber }
    // Re-using original `toCallState`
    const callState = toCallState(callResult, contract.interface, fragment, blockNumber)

    if (!callState) {
      console.warn(`extractResults::no callState`)
      return null
    }

    const { valid, error, result } = callState

    if (!valid || error) {
      console.warn(`extractResults::not valid callState or error`, valid, error)
      return null
    }

    return result
  })
}

/**
 * Version of `getSingleCallResult` that handles multiple calls at once
 *
 * Based on /src/state/multicall/hooks.ts > useSingleCallResult
 *
 * All types and intermediate steps are based on the original hooks
 * This was kept as close as possible to original.
 * Probably not all steps/types make sense for our use-case but changing them
 * might require changing the base multicall implementation.
 *
 * One thing to keep in mind is that multicalls are stored on redux and executed via an updater
 * This function makes the execution "immediate" instead. Well, kind of. It still is async, but
 * the results can be awaited.
 * The original implementation can be summarized in 3 parts:
 * 1. A hook to prepare the Call objects and add them to the redux
 * 2. The updater that gets Call objects, executes them and add the results to redux
 * 3. A hook to get the results from redux
 *
 * Here there's just one part, doing all at once.
 */
export async function getMultipleCallsResults(params: GetMultipleCallsParams): Promise<(Result | null | undefined)[]> {
  const { callsParams, multicall2Contract, latestBlockNumber } = params

  const calls = callsParams.map((callParams) => createCall(callParams))

  const callsResults = await executeCalls({ calls, multicall2Contract, latestBlockNumber })

  if (!callsResults) {
    console.warn(`getMultipleCallsResults::no callsResults`)
    // TODO: this looks dumb. Maybe throw instead?
    return Array(callsParams.length).fill(null)
  }

  // Assumes nothing went wrong and callsResults are still aligned with callsParams
  const results = callsResults.results.map((results, index) => ({ ...results, ...callsParams[index] }))

  return extractResults({ ...callsResults, results })
}
