import { delay, isTruthy } from '@cowprotocol/common-utils'
import { SAFE_TRANSACTION_SERVICE_URL } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ComposableCoW } from '@cowprotocol/cowswap-abis'
import type { AllTransactionsListResponse } from '@safe-global/api-kit'
import { SafeMultisigTransactionResponse } from '@safe-global/types-kit'

import ms from 'ms.macro'

import { SafeTransactionParams } from 'common/types'

import { ConditionalOrderParams, TwapOrdersSafeData } from '../types'

// ComposableCoW.createWithContext method
const CREATE_COMPOSABLE_ORDER_SELECTOR = '0d0d9800'
// Each page contains 100 transactions by default, so we need to fetch 40 pages to get 4000 transactions
const SAFE_TX_HISTORY_DEPTH = 40
// Just in case, make a short delay between requests
const SAFE_TX_REQUEST_DELAY = ms`100ms`

const HISTORY_TX_COUNT_LIMIT = 100

type TwapDataArray = TwapOrdersSafeData[]

export async function fetchTwapOrdersFromSafe(
  chainId: SupportedChainId,
  safeAddress: string,
  composableCowContract: ComposableCoW,
  setData: (state: TwapDataArray) => void,
  /**
   * Example of the second chunk url:
   * https://safe-transaction-goerli.safe.global/api/v1/safes/0xe9B79591E270B3bCd0CC7e84f7B7De74BA3D0E2F/all-transactions/?executed=false&limit=20&offset=40&queued=true&trusted=true
   */
  nextUrl?: string,
  accumulator: TwapDataArray[] = [],
): Promise<TwapDataArray> {
  const response = await fetchSafeTransactionsChunk(chainId, safeAddress, nextUrl)

  const results = response?.results || []
  const parsedResults = parseSafeTransactionsResult(composableCowContract, results)

  accumulator.push(parsedResults)

  const flattenState = accumulator.flat()

  setData(flattenState)

  // Exit from the recursion if we have enough transactions or there is no next page
  if (accumulator.length >= SAFE_TX_HISTORY_DEPTH || !response?.next) {
    return flattenState
  }

  return fetchTwapOrdersFromSafe(chainId, safeAddress, composableCowContract, setData, response.next, accumulator)
}

async function fetchSafeTransactionsChunk(
  chainId: SupportedChainId,
  safeAddress: string,
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

  /**
   * SafeApiKit set limit=20 by default and there is no way to change it using the SDK
   *
   */
  const url = getSafeHistoryRequestUrl(chainId, safeAddress, 0)

  return fetch(url).then((res) => res.json())
}

function getSafeHistoryRequestUrl(chainId: SupportedChainId, safeAddress: string, offset: number): string {
  return `${SAFE_TRANSACTION_SERVICE_URL[chainId]}/api/v1/safes/${safeAddress}/all-transactions/?executed=false&limit=${HISTORY_TX_COUNT_LIMIT}&offset=${offset}&queued=true&trusted=true`
}

function parseSafeTransactionsResult(
  composableCowContract: ComposableCoW,
  results: AllTransactionsListResponse['results'],
): TwapOrdersSafeData[] {
  return results
    .map<TwapOrdersSafeData | null>((result) => {
      if (!result.data || !isSafeMultisigTransactionListResponse(result)) return null

      const selectorIndex = result.data.indexOf(CREATE_COMPOSABLE_ORDER_SELECTOR)

      if (selectorIndex < 0) return null

      const callData = '0x' + result.data.substring(selectorIndex)

      const conditionalOrderParams = parseConditionalOrderParams(composableCowContract, callData)

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
    nonce: Number(nonce),
  }
}
