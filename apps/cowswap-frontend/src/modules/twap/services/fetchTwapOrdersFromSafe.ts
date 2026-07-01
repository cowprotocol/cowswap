import { delay, isRecord } from '@cowprotocol/common-utils'
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

export type TwapDataArray = TwapOrdersSafeData[]

export type FetchTwapOrdersFromSafeResult = {
  orders: TwapDataArray
  newestSubmissionDate?: string
  complete: boolean
}

type SafeTransactionsChunk = AllTransactionsListResponse & { fetchError?: boolean }

export async function fetchTwapOrdersFromSafe(
  chainId: SupportedChainId,
  safeAddress: string,
  composableCowContract: ComposableCowContractData,
  executedSince?: string,
  nextUrl?: string,
  accumulator: TwapDataArray[] = [],
  onProgress?: (state: TwapDataArray) => void,
): Promise<FetchTwapOrdersFromSafeResult> {
  const response = await fetchSafeTransactionsChunk(chainId, safeAddress, nextUrl)

  const results = response?.results || []
  const parsedResults = parseSafeTransactionsResult(composableCowContract, results)

  accumulator.push(parsedResults)

  const flattenState = accumulator.flat()
  onProgress?.(mergeTwapOrdersByHash(flattenState))

  // Exit from the recursion if we have enough transactions or there is no next page

  if (accumulator.length >= SAFE_TX_HISTORY_DEPTH || !response?.next) {
    /**
     * Also fetch recently executed transactions (one page, newest-first).
     * For Safe via WalletConnect, executed transactions disappear from the pending
     * queue (executed=false), so we need a separate pass to capture them and set
     * isExecuted=true — which lets the status logic correctly transition the order
     * away from WaitSigning.
     */
    const executedResult = await fetchRecentlyExecutedTransactions(
      chainId,
      safeAddress,
      composableCowContract,
      executedSince,
    )

    return {
      orders: mergeTwapOrdersByHash([...flattenState, ...executedResult.orders]),
      newestSubmissionDate: executedResult.newestSubmissionDate,
      complete: !response.fetchError && executedResult.complete,
    }
  }

  return fetchTwapOrdersFromSafe(
    chainId,
    safeAddress,
    composableCowContract,
    executedSince,
    response.next,
    accumulator,
    onProgress,
  )
}

async function fetchRecentlyExecutedTransactions(
  chainId: SupportedChainId,
  safeAddress: string,
  composableCowContract: ComposableCowContractData,
  since?: string,
  nextUrl?: string,
  accumulator: TwapDataArray[] = [],
  newestSubmissionDate?: string,
): Promise<FetchTwapOrdersFromSafeResult> {
  try {
    const url = getExecutedTransactionsUrl(chainId, safeAddress, since, nextUrl)
    const headers = getSafeApiHeaders()

    logExecutedTransactionsFetch(nextUrl, since)
    const response = await fetchWithFallback<AllTransactionsListResponse>(url, headers)
    const results = response?.results || []
    const parsedResults = parseSafeTransactionsResult(composableCowContract, results)
    const nextNewestSubmissionDate = getNewestSubmissionDate([
      newestSubmissionDate,
      ...results.map(getTransactionSubmissionDate),
    ])

    accumulator.push(parsedResults)

    const nextExecutedPage = getNextExecutedPage(response, accumulator)

    if (nextExecutedPage) {
      return fetchRecentlyExecutedTransactions(
        chainId,
        safeAddress,
        composableCowContract,
        since,
        nextExecutedPage,
        accumulator,
        nextNewestSubmissionDate,
      )
    }

    return {
      orders: accumulator.flat(),
      newestSubmissionDate: nextNewestSubmissionDate,
      complete: !response.next,
    }
  } catch (error) {
    console.error('Error fetching executed Safe transactions', { safeAddress }, error)
    return { orders: [], complete: false }
  }
}

function getExecutedTransactionsUrl(
  chainId: SupportedChainId,
  safeAddress: string,
  since?: string,
  nextUrl?: string,
): string {
  return nextUrl || getSafeHistoryRequestUrl(chainId, safeAddress, true, since)
}

function logExecutedTransactionsFetch(nextUrl?: string, since?: string): void {
  const page = nextUrl ? 'next' : 'first'
  const sinceText = since && !nextUrl ? ` since ${since}` : ''

  console.log(`[COW][SafeAPI] Fetch TWAP executed orders (${page} page${sinceText})`)
}

function getNextExecutedPage(response: AllTransactionsListResponse, accumulator: TwapDataArray[]): string | undefined {
  return accumulator.length < SAFE_TX_HISTORY_DEPTH ? response.next || undefined : undefined
}

/**
 * Merge two TwapDataArrays by safeTxHash, preferring entries with isExecuted=true.
 * This ensures that if the same transaction appears in both the pending and executed
 * fetches (e.g. a tx that just executed), we keep the executed version.
 */
export function mergeTwapOrdersByHash(items: TwapDataArray): TwapDataArray {
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
): Promise<SafeTransactionsChunk> {
  const headers = getSafeApiHeaders()

  if (nextUrl) {
    try {
      console.log('[COW][SafeAPI] Fetch TWAP pending orders (next page)')
      const response = await fetchWithFallback<AllTransactionsListResponse>(nextUrl, headers)

      await delay(SAFE_TX_REQUEST_DELAY)

      return response
    } catch (error) {
      console.error('Error fetching Safe transactions', { safeAddress, nextUrl }, error)

      return { results: [], count: 0, fetchError: true }
    }
  }

  const url = getSafeHistoryRequestUrl(chainId, safeAddress, false)

  console.log('[COW][SafeAPI] Fetch TWAP pending orders (first page)')
  return fetchWithFallback(url, headers)
}

function fetchWithFallback<T>(url: string, headers: HeadersInit): Promise<T> {
  return fetch(url, { headers })
    .then((res) => {
      if (res.status === 429 || res.status === 403) {
        console.log('[COW][SafeAPI] Fetching without API Key (fallback)')
        return fetch(url)
      }
      return res
    })
    .then((res) => res.json())
}

function getSafeHistoryRequestUrl(
  chainId: SupportedChainId,
  safeAddress: string,
  executed: boolean,
  since?: string,
): string {
  const params = new URLSearchParams({
    executed: String(executed),
    limit: String(HISTORY_TX_COUNT_LIMIT),
    ordering: '-submissionDate',
    trusted: 'true',
  })

  if (since) params.set('submission_date__gte', since)

  if (!executed) {
    params.set('queued', 'true')
  }

  return `${getSafeApiUrl(chainId)}/v2/safes/${safeAddress}/multisig-transactions/?${params.toString()}`
}

function getNewestSubmissionDate(dates: (string | undefined)[]): string | undefined {
  let latest: string | undefined

  for (const date of dates) {
    if (date && (!latest || date > latest)) {
      latest = date
    }
  }

  return latest
}

function getTransactionSubmissionDate(transaction: unknown): string | undefined {
  return isRecord(transaction) && typeof transaction.submissionDate === 'string'
    ? transaction.submissionDate
    : undefined
}
