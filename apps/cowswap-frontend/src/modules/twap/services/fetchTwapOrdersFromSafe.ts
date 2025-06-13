import { ComposableCoW } from '@cowprotocol/abis'
import { delay, isTruthy } from '@cowprotocol/common-utils'
import type SafeApiKit from '@safe-global/api-kit'
import type { AllTransactionsListResponse } from '@safe-global/api-kit'
import type { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'

import ms from 'ms.macro'

import { SafeTransactionParams } from 'common/types'

import { ConditionalOrderParams, TwapOrdersSafeData } from '../types'

// ComposableCoW.createWithContext method
const CREATE_COMPOSABLE_ORDER_SELECTOR = '0d0d9800'
// Each page contains 20 transactions by default, so we need to fetch 200 pages to get 4000 transactions
const SAFE_TX_HISTORY_DEPTH = 200
// Just in case, make a short delay between requests
const SAFE_TX_REQUEST_DELAY = ms`100ms`

export async function fetchTwapOrdersFromSafe(
  safeAddress: string,
  safeApiKit: SafeApiKit,
  composableCowContract: ComposableCoW,
  /**
   * Example of the second chunk url:
   * https://safe-transaction-goerli.safe.global/api/v1/safes/0xe9B79591E270B3bCd0CC7e84f7B7De74BA3D0E2F/all-transactions/?executed=false&limit=20&offset=40&queued=true&trusted=true
   */
  nextUrl?: string,
  accumulator: TwapOrdersSafeData[][] = [],
): Promise<TwapOrdersSafeData[]> {
  const response = await fetchSafeTransactionsChunk(safeAddress, safeApiKit, nextUrl)

  const results = response?.results || []
  const parsedResults = parseSafeTranasctionsResult(safeAddress, composableCowContract, results)

  accumulator.push(parsedResults)

  // Exit from the recursion if we have enough transactions or there is no next page
  if (accumulator.length >= SAFE_TX_HISTORY_DEPTH || !response?.next) {
    return accumulator.flat()
  }

  return fetchTwapOrdersFromSafe(safeAddress, safeApiKit, composableCowContract, response.next, accumulator)
}

async function fetchSafeTransactionsChunk(
  safeAddress: string,
  safeApiKit: SafeApiKit,
  nextUrl?: string,
): Promise<AllTransactionsListResponse> {
  if (nextUrl) {
    try {
      const response: AllTransactionsListResponse = await fetch(nextUrl).then((res) => res.json())

      await delay(SAFE_TX_REQUEST_DELAY)

      return response
    } catch (error) {
      console.error('Error fetching Safe transactions', { safeAddress, nextUrl }, error)

      return { results: [], count: 0 }
    }
  }

  return safeApiKit.getAllTransactions(safeAddress)
}

function parseSafeTranasctionsResult(
  safeAddress: string,
  composableCowContract: ComposableCoW,
  results: AllTransactionsListResponse['results'],
): TwapOrdersSafeData[] {
  return results
    .map<TwapOrdersSafeData | null>((result) => {
      if (!result.data || !isSafeMultisigTransactionListResponse(result)) return null

      const selectorIndex = result.data.indexOf(CREATE_COMPOSABLE_ORDER_SELECTOR)

      if (selectorIndex < 0) return null

      const callData = '0x' + result.data.substring(selectorIndex)

      const conditionalOrderParams = parseConditionalOrderParams(safeAddress, composableCowContract, callData)

      if (!conditionalOrderParams) return null

      const safeTxParams = getSafeTransactionParams(result)

      return {
        conditionalOrderParams,
        safeTxParams,
      }
    })
    .filter(isTruthy)
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSafeMultisigTransactionListResponse(response: any): response is SafeMultisigTransactionResponse {
  return !!response.data && !!response.submissionDate
}

function parseConditionalOrderParams(
  safeAddress: string,
  composableCowContract: ComposableCoW,
  callData: string,
): ConditionalOrderParams | null {
  try {
    const _result = composableCowContract.interface.decodeFunctionData('createWithContext', callData)
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { params } = _result as any as { params: ConditionalOrderParams }

    return { handler: params.handler, salt: params.salt, staticInput: params.staticInput }
  } catch {
    return null
  }
}

function getSafeTransactionParams(result: SafeMultisigTransactionResponse): SafeTransactionParams {
  const { isExecuted, submissionDate, executionDate, nonce, confirmationsRequired, confirmations, safeTxHash } = result

  return {
    isExecuted,
    submissionDate,
    executionDate,
    confirmationsRequired,
    confirmations: confirmations?.length || 0,
    safeTxHash,
    nonce,
  }
}
