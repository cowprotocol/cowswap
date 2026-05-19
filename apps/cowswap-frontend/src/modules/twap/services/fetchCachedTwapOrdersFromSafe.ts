import { isTruthy } from '@cowprotocol/common-utils'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { ComposableCowContractData } from 'modules/advancedOrders/hooks/useComposableCowContract'

import { fetchTwapOrdersFromSafe, mergeTwapOrdersByHash } from './fetchTwapOrdersFromSafe'

import type { TwapDataArray } from './fetchTwapOrdersFromSafe'

const SAFE_TX_SCAN_CACHE_VERSION = 10
const SAFE_TX_SCAN_OVERLAP = ms`1m`

type SafeTwapScanCache = {
  version: typeof SAFE_TX_SCAN_CACHE_VERSION
  newestSubmissionDate: string
  orders: TwapDataArray
}

// eslint-disable-next-line complexity
export async function fetchCachedTwapOrdersFromSafe(
  chainId: SupportedChainId,
  safeAddress: string,
  composableCowContract: ComposableCowContractData,
  setData: (state: TwapDataArray) => void,
): Promise<TwapDataArray> {
  const cached = readSafeTwapScanCache(chainId, safeAddress)
  const executedSince = cached ? getOverlappedSubmissionDate(cached.newestSubmissionDate) : undefined

  if (cached) setData(cached.orders)

  const fresh = await fetchTwapOrdersFromSafe(chainId, safeAddress, composableCowContract, executedSince).catch(
    (error) => {
      if (!cached) throw error

      console.error('Error fetching TWAP orders from Safe', { safeAddress }, error)
      return null
    },
  )

  if (!fresh) return cached?.orders || []
  if (!fresh.complete && cached) return cached.orders

  const merged = mergeTwapOrdersByHash(cached ? [...cached.orders, ...fresh.orders] : fresh.orders)
  const executedOrders = merged.filter((order) => order.safeTxParams.isExecuted)
  const newestSubmissionDate = getNewestSubmissionDate([
    cached?.newestSubmissionDate,
    fresh.newestSubmissionDate,
    ...executedOrders.map((order) => order.safeTxParams.submissionDate),
  ])

  if (fresh.complete) {
    writeSafeTwapScanCache(chainId, safeAddress, executedOrders, newestSubmissionDate)
  }

  setData(merged)
  return merged
}

function getSafeTwapScanCacheKey(chainId: SupportedChainId, safeAddress: string): string {
  return `cow:twap:safe-scan:v${SAFE_TX_SCAN_CACHE_VERSION}:${chainId}:${getAddressKey(safeAddress)}`
}

function readSafeTwapScanCache(chainId: SupportedChainId, safeAddress: string): SafeTwapScanCache | null {
  try {
    const serialized = window.localStorage.getItem(getSafeTwapScanCacheKey(chainId, safeAddress))
    if (!serialized) return null

    const parsed = JSON.parse(serialized) as Partial<SafeTwapScanCache>

    if (parsed.version !== SAFE_TX_SCAN_CACHE_VERSION || !parsed.newestSubmissionDate || !parsed.orders) return null

    return {
      version: SAFE_TX_SCAN_CACHE_VERSION,
      newestSubmissionDate: parsed.newestSubmissionDate,
      orders: parsed.orders.filter((order) => order.safeTxParams.isExecuted),
    }
  } catch {
    return null
  }
}

function writeSafeTwapScanCache(
  chainId: SupportedChainId,
  safeAddress: string,
  orders: TwapDataArray,
  newestSubmissionDate: string,
): void {
  if (!newestSubmissionDate) return

  try {
    const cache: SafeTwapScanCache = {
      version: SAFE_TX_SCAN_CACHE_VERSION,
      newestSubmissionDate,
      orders,
    }

    console.log(`[COW][SafeAPI] Saving to cache TWAP executed orders newestSubmissionDate=${newestSubmissionDate}`)
    window.localStorage.setItem(getSafeTwapScanCacheKey(chainId, safeAddress), JSON.stringify(cache))
  } catch {
    // Ignore storage failures. The next load will run without cache.
  }
}

function getOverlappedSubmissionDate(submissionDate: string): string {
  return new Date(new Date(submissionDate).getTime() - SAFE_TX_SCAN_OVERLAP).toISOString()
}

function getNewestSubmissionDate(dates: (string | undefined)[]): string {
  return dates.filter(isTruthy).reduce((latest, date) => (date > latest ? date : latest), '')
}
