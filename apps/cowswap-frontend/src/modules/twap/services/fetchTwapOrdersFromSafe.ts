import { delay, isTruthy } from '@cowprotocol/common-utils'
import { getSafeApiUrl } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { AllTransactionsListResponse } from '@safe-global/api-kit'
import type { SafeMultisigTransactionResponse } from '@safe-global/types-kit'

import ms from 'ms.macro'
import { decodeFunctionData } from 'viem'

import { ComposableCowContractData } from 'modules/advancedOrders/hooks/useComposableCowContract'

import { SafeTransactionParams } from 'common/types'

import { ConditionalOrderParams, TwapOrdersSafeData } from '../types'

import type { Hex } from 'viem'

// ComposableCoW.createWithContext method
const CREATE_COMPOSABLE_ORDER_SELECTOR = '0d0d9800'
// Each page contains 100 transactions by default, so we need to fetch 40 pages to get 4000 transactions
const SAFE_TX_HISTORY_DEPTH = 40
// Just in case, make a short delay between requests
const SAFE_TX_REQUEST_DELAY = ms`100ms`

const HISTORY_TX_COUNT_LIMIT = 100

const SAFE_API_AUTH_TOKEN = process.env.REACT_APP_SAFE_API_AUTH_TOKEN

function getSafeApiHeaders(): HeadersInit {
  if (!SAFE_API_AUTH_TOKEN) return {}
  return { Authorization: `Bearer ${SAFE_API_AUTH_TOKEN}` }
}

type TwapDataArray = TwapOrdersSafeData[]

export async function fetchTwapOrdersFromSafe(
  chainId: SupportedChainId,
  safeAddress: string,
  composableCowContract: ComposableCowContractData,
  setData: (state: TwapDataArray) => void,
  nextUrl?: string,
  accumulator: TwapDataArray[] = [],
): Promise<TwapDataArray> {
  const response = await fetchSafeTransactionsChunk(chainId, safeAddress, nextUrl)

  const results = response?.results || []
  const parsedResults = parseSafeTransactionsResult(composableCowContract, results)

  accumulator.push(parsedResults)

  const flattenState = accumulator.flat()

  // Exit from the recursion if we have enough transactions or there is no next page

  if (accumulator.length >= SAFE_TX_HISTORY_DEPTH || !response?.next) {
    /**
     * Also fetch recently executed transactions (one page, newest-first).
     * For Safe via WalletConnect, executed transactions disappear from the pending
     * queue (executed=false), so we need a separate pass to capture them and set
     * isExecuted=true — which lets the status logic correctly transition the order
     * away from WaitSigning.
     */
    const executedResults = await fetchRecentlyExecutedTransactions(chainId, safeAddress, composableCowContract)

    const merged = mergeByHash([...flattenState, ...executedResults])

    setData(merged)
    return merged
  }

  return fetchTwapOrdersFromSafe(chainId, safeAddress, composableCowContract, setData, response.next, accumulator)
}

async function fetchRecentlyExecutedTransactions(
  chainId: SupportedChainId,
  safeAddress: string,
  composableCowContract: ComposableCowContractData,
): Promise<TwapDataArray> {
  try {
    const url = `${getSafeApiUrl(chainId)}/v2/safes/${safeAddress}/multisig-transactions/?executed=true&limit=${HISTORY_TX_COUNT_LIMIT}&ordering=-submissionDate`

    const headers = getSafeApiHeaders()

    const response = await fetchWithFallback<AllTransactionsListResponse>(url, headers)
    const results = response?.results || []

    return parseSafeTransactionsResult(composableCowContract, results)
  } catch (error) {
    console.error('Error fetching executed Safe transactions', { safeAddress }, error)
    return []
  }
}

/**
 * Merge two TwapDataArrays by safeTxHash, preferring entries with isExecuted=true.
 * This ensures that if the same transaction appears in both the pending and executed
 * fetches (e.g. a tx that just executed), we keep the executed version.
 */
function mergeByHash(items: TwapDataArray): TwapDataArray {
  const map = new Map<string, TwapOrdersSafeData>()

  for (const item of items) {
    const hash = item.safeTxParams.safeTxHash
    const existing = map.get(hash)

    if (!existing || (!existing.safeTxParams.isExecuted && item.safeTxParams.isExecuted)) {
      map.set(hash, item)
    }
  }

  return Array.from(map.values())
}

async function fetchSafeTransactionsChunk(
  chainId: SupportedChainId,
  safeAddress: string,
  nextUrl?: string,
): Promise<AllTransactionsListResponse> {
  const headers = getSafeApiHeaders()

  if (nextUrl) {
    try {
      const response = await fetchWithFallback<AllTransactionsListResponse>(nextUrl, headers)

      await delay(SAFE_TX_REQUEST_DELAY)

      return response
    } catch (error) {
      console.error('Error fetching Safe transactions', { safeAddress, nextUrl }, error)

      return { results: [], count: 0 }
    }
  }

  const url = getSafeHistoryRequestUrl(chainId, safeAddress, 0)

  return fetchWithFallback(url, headers)
}

function fetchWithFallback<T>(url: string, headers: HeadersInit): Promise<T> {
  return fetch(url, { headers })
    .then((res) => {
      if (res.status === 429 || res.status === 403) {
        return fetch(url)
      }
      return res
    })
    .then((res) => res.json())
}

function getSafeHistoryRequestUrl(chainId: SupportedChainId, safeAddress: string, offset: number): string {
  return `${getSafeApiUrl(chainId)}/v2/safes/${safeAddress}/multisig-transactions/?executed=false&limit=${HISTORY_TX_COUNT_LIMIT}&offset=${offset}&queued=true&trusted=true`
}

function parseSafeTransactionsResult(
  composableCowContract: ComposableCowContractData,
  results: AllTransactionsListResponse['results'],
): TwapOrdersSafeData[] {
  return results
    .map<TwapOrdersSafeData | null>((result) => {
      if (!result.data || !isSafeMultisigTransactionListResponse(result)) return null

      const selectorIndex = result.data.indexOf(CREATE_COMPOSABLE_ORDER_SELECTOR)

      if (selectorIndex < 0) return null

      const conditionalOrderParams = parseConditionalOrderParams(
        composableCowContract,
        `0x${result.data.substring(selectorIndex)}`,
      )

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
  composableCowContract: ComposableCowContractData,
  callData: Hex,
): ConditionalOrderParams | null {
  try {
    const { args } = decodeFunctionData({
      abi: composableCowContract.abi,
      data: callData,
    })

    const [params] = args as unknown as [ConditionalOrderParams]

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
