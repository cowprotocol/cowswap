import { delay } from '@cowprotocol/common-utils'
import { getSafeApiUrl } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { AllTransactionsListResponse } from '@safe-global/api-kit'

import ms from 'ms.macro'

import { ComposableCowContractData } from 'modules/advancedOrders'

import { parseSafeTransactionsResult } from './parseTwapSafeTransactions.utils'

import { TwapOrdersSafeData } from '../types'
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

    const response: AllTransactionsListResponse = await fetch(url, { headers }).then((res) => res.json())
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
      const response: AllTransactionsListResponse = await fetch(nextUrl, { headers }).then((res) => res.json())

      await delay(SAFE_TX_REQUEST_DELAY)

      return response
    } catch (error) {
      console.error('Error fetching Safe transactions', { safeAddress, nextUrl }, error)

      return { results: [], count: 0 }
    }
  }

  const url = getSafeHistoryRequestUrl(chainId, safeAddress, 0)

  return fetch(url, { headers }).then((res) => res.json())
}

function getSafeHistoryRequestUrl(chainId: SupportedChainId, safeAddress: string, offset: number): string {
  return `${getSafeApiUrl(chainId)}/v2/safes/${safeAddress}/multisig-transactions/?executed=false&limit=${HISTORY_TX_COUNT_LIMIT}&offset=${offset}&queued=true&trusted=true`
}
