import { isTruthy } from '@cowprotocol/common-utils'
import { localForageJotai } from '@cowprotocol/core'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { ComposableCowContractData } from 'modules/advancedOrders/hooks/useComposableCowContract'

import { fetchTwapOrdersFromSafe, mergeTwapOrdersByHash } from './fetchTwapOrdersFromSafe'

import type { TwapDataArray } from './fetchTwapOrdersFromSafe'

const SAFE_TX_SCAN_CACHE_VERSION = 1
const SAFE_TX_SCAN_CACHE_KEY_PREFIX = 'twapSafeScanCache:v'
const SAFE_TX_SCAN_CACHE_IDB_KEY = `${SAFE_TX_SCAN_CACHE_KEY_PREFIX}${SAFE_TX_SCAN_CACHE_VERSION}`
const SAFE_TX_SCAN_OVERLAP = ms`1m`

type SafeTwapScanCache = {
  newestSubmissionDate: string
  orders: TwapDataArray
}

type SafeTwapScanCacheMap = Record<string, SafeTwapScanCache | undefined>

// eslint-disable-next-line complexity
export async function fetchCachedTwapOrdersFromSafe(
  chainId: SupportedChainId,
  safeAddress: string,
  composableCowContract: ComposableCowContractData,
  setData: (state: TwapDataArray) => void,
): Promise<TwapDataArray> {
  const cached = await readSafeTwapScanCache(chainId, safeAddress)
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
    await writeSafeTwapScanCache(chainId, safeAddress, executedOrders, newestSubmissionDate)
  }

  setData(merged)
  return merged
}

function getSafeTwapScanCacheEntryKey(chainId: SupportedChainId, safeAddress: string): string {
  return `${chainId}:${getAddressKey(safeAddress)}`
}

async function readSafeTwapScanCache(
  chainId: SupportedChainId,
  safeAddress: string,
): Promise<SafeTwapScanCache | null> {
  try {
    await cleanupOlderCacheVersions()

    const cache = await localForageJotai.getItem<SafeTwapScanCacheMap>(SAFE_TX_SCAN_CACHE_IDB_KEY)
    const entry = cache?.[getSafeTwapScanCacheEntryKey(chainId, safeAddress)]

    if (!entry?.newestSubmissionDate || !entry.orders) return null

    return {
      newestSubmissionDate: entry.newestSubmissionDate,
      orders: entry.orders.filter((order) => order.safeTxParams.isExecuted),
    }
  } catch {
    return null
  }
}

async function writeSafeTwapScanCache(
  chainId: SupportedChainId,
  safeAddress: string,
  orders: TwapDataArray,
  newestSubmissionDate: string,
): Promise<void> {
  if (!newestSubmissionDate) return

  try {
    const cache = (await localForageJotai.getItem<SafeTwapScanCacheMap>(SAFE_TX_SCAN_CACHE_IDB_KEY)) || {}

    cache[getSafeTwapScanCacheEntryKey(chainId, safeAddress)] = {
      newestSubmissionDate,
      orders,
    }

    console.log(`[COW][SafeAPI] Saving to cache TWAP executed orders newestSubmissionDate=${newestSubmissionDate}`)
    await localForageJotai.setItem(SAFE_TX_SCAN_CACHE_IDB_KEY, cache)
  } catch {
    // Ignore storage failures. The next load will run without cache.
  }
}

async function cleanupOlderCacheVersions(): Promise<void> {
  try {
    const keys = await localForageJotai.keys()
    const oldKeys = keys.filter(
      (key) => key.startsWith(SAFE_TX_SCAN_CACHE_KEY_PREFIX) && key !== SAFE_TX_SCAN_CACHE_IDB_KEY,
    )

    await Promise.all(oldKeys.map((key) => localForageJotai.removeItem(key)))
  } catch {}
}

function getOverlappedSubmissionDate(submissionDate: string): string {
  return new Date(new Date(submissionDate).getTime() - SAFE_TX_SCAN_OVERLAP).toISOString()
}

function getNewestSubmissionDate(dates: (string | undefined)[]): string {
  return dates.filter(isTruthy).reduce((latest, date) => (date > latest ? date : latest), '')
}
