import { useEffect, useMemo, useState } from 'react'

import { Address, SupportedChainId } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { getOrders } from 'api/cowProtocol'

import { AFFILIATE_SUPPORTED_CHAIN_IDS } from '../config/affiliateProgram.const'
import { TraderActivityRow } from '../lib/affiliateProgramTypes'
import {
  buildTraderActivityRow,
  extractFullAppDataFromResponse,
  getAppDataHash,
  getReferrerCodeFromAppData,
  isDateWithinRewardsWindow,
  getRowTimestamp,
} from '../lib/traderActivity'

const TRADER_ACTIVITY_ROW_LIMIT = 10
const TRADER_ACTIVITY_FETCH_LIMIT_PER_CHAIN = 20

type AppDataGetter = {
  getAppData?: (appDataHash: string, context: { chainId: SupportedChainId }) => Promise<unknown>
}

type ChainOrdersResult = {
  chainId: SupportedChainId
  orders: unknown[]
}

interface UseTraderActivityParams {
  account: string | undefined
  boundReferrerCode?: string
  linkedSince?: string
  rewardsEnd?: string
}

interface UseTraderActivityResult {
  rows: TraderActivityRow[]
  loading: boolean
}

const EMPTY_ROWS: TraderActivityRow[] = []

function getOrderFullAppData(order: unknown): string | undefined {
  if (!order || typeof order !== 'object') return undefined

  const fullAppData = (order as Record<string, unknown>).fullAppData
  return typeof fullAppData === 'string' ? fullAppData : undefined
}

async function fetchFullAppDataByHash(appDataHash: string, chainId: SupportedChainId): Promise<string | undefined> {
  const appDataGetter = orderBookApi as unknown as AppDataGetter

  if (!appDataGetter.getAppData) {
    return undefined
  }

  try {
    const response = await appDataGetter.getAppData(appDataHash, { chainId })

    return extractFullAppDataFromResponse(response)
  } catch {
    return undefined
  }
}

async function loadOrdersByChain(owner: string): Promise<ChainOrdersResult[]> {
  const ordersByChain = await Promise.all(
    AFFILIATE_SUPPORTED_CHAIN_IDS.map(async (chainId): Promise<ChainOrdersResult> => {
      try {
        const orders = await getOrders(
          {
            owner: owner as Address,
            limit: TRADER_ACTIVITY_FETCH_LIMIT_PER_CHAIN,
          },
          { chainId },
        )

        return { chainId, orders }
      } catch {
        return { chainId, orders: [] }
      }
    }),
  )

  return ordersByChain
}

async function getResolvedReferrerCode(
  order: unknown,
  chainId: SupportedChainId,
  appDataCache: Map<string, Promise<string | undefined>>,
): Promise<string | undefined> {
  const fullAppData = getOrderFullAppData(order)
  const referrerFromFullData = getReferrerCodeFromAppData(fullAppData)

  if (referrerFromFullData) {
    return referrerFromFullData
  }

  const appDataHash = getAppDataHash(order)
  if (!appDataHash) {
    return undefined
  }

  const cacheKey = `${chainId}:${appDataHash.toLowerCase()}`
  const cachedRequest = appDataCache.get(cacheKey)

  if (cachedRequest) {
    const cachedFullAppData = await cachedRequest
    return getReferrerCodeFromAppData(cachedFullAppData)
  }

  const request = fetchFullAppDataByHash(appDataHash, chainId)
  appDataCache.set(cacheKey, request)

  const fetchedFullAppData = await request
  return getReferrerCodeFromAppData(fetchedFullAppData)
}

async function loadTraderActivityRows({
  account,
  boundReferrerCode,
  linkedSince,
  rewardsEnd,
}: UseTraderActivityParams): Promise<TraderActivityRow[]> {
  if (!account) return EMPTY_ROWS

  const appDataCache = new Map<string, Promise<string | undefined>>()
  const chainOrders = await loadOrdersByChain(account)
  const rowsByChain = await Promise.all(
    chainOrders.map(async ({ chainId, orders }) => {
      return Promise.all(
        orders.map(async (order) => {
          const referrerCode = await getResolvedReferrerCode(order, chainId, appDataCache)

          return buildTraderActivityRow({
            order,
            chainId,
            referrerCode,
            boundReferrerCode,
            linkedSince,
            rewardsEnd,
          })
        }),
      )
    }),
  )

  return rowsByChain
    .flat()
    .filter((row) => isDateWithinRewardsWindow(row.date, linkedSince, rewardsEnd))
    .sort((a, b) => getRowTimestamp(b) - getRowTimestamp(a))
    .slice(0, TRADER_ACTIVITY_ROW_LIMIT)
}

export function useTraderActivity(params: UseTraderActivityParams): UseTraderActivityResult {
  const { account, boundReferrerCode, linkedSince, rewardsEnd } = params
  const [rows, setRows] = useState<TraderActivityRow[]>(EMPTY_ROWS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!account) {
      setRows(EMPTY_ROWS)
      setLoading(false)
      return
    }

    const loadActivity = async (): Promise<void> => {
      setLoading(true)

      try {
        const nextRows = await loadTraderActivityRows({
          account,
          boundReferrerCode,
          linkedSince,
          rewardsEnd,
        })
        if (cancelled) {
          return
        }
        setRows(nextRows)
      } catch {
        if (cancelled) {
          return
        }

        setRows(EMPTY_ROWS)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadActivity()

    return () => {
      cancelled = true
    }
  }, [account, boundReferrerCode, linkedSince, rewardsEnd])

  return useMemo(
    () => ({
      rows,
      loading,
    }),
    [rows, loading],
  )
}
