import { useEffect, useMemo, useState } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { normalizeError } from '@cowprotocol/common-utils'

import { useNetworkId } from 'state/network'
import useSWR from 'swr'
import { Network, UiError } from 'types'
import { getProtocolFees, transformTrade } from 'utils'

import { getTrades, Order, ProtocolFee, RawTrade, Trade } from 'api/operator'

import { web3 } from '../explorer/api'

type Result = {
  trades: Trade[]
  error?: UiError
  isLoading: boolean
  hasNextPage: boolean
}

type TradesTimestamps = { [txHash: string]: number }

const tradesTimestampsCache: { [blockNumber: number]: Promise<number> } = {}

type AllTradesResult = {
  // Undefined while unknown (loading, failed, or no order).
  rawTrades?: RawTrade[]
  error?: UiError
  isLoading: boolean
}

type ProtocolFeesResult = {
  // Undefined while unknown (loading, failed, or no order); `[]` means no fee was charged.
  protocolFees?: ProtocolFee[]
  error?: UiError
  isLoading: boolean
}

// Large enough that most orders need a single call.
const ALL_TRADES_PAGE_SIZE = 1000
// Safety bound; reaching it means the paging is broken, not that the order has this many fills.
const MAX_TRADES_PAGES = 100

const TRADES_ERROR = 'Failed to fetch trades'
const PROTOCOL_FEES_ERROR = 'Failed to fetch the costs and fees breakdown'

/**
 * Order-level fee breakdown, derived from every fill. Unlike {@link useOrderTrades}, which is
 * scoped to the selected Fills page, this does not change as the user pages.
 */
export function useOrderProtocolFees(order: Order | null): ProtocolFeesResult {
  const { rawTrades, error, isLoading } = useAllOrderTrades(order)

  return useMemo<ProtocolFeesResult>(
    () => ({
      protocolFees: rawTrades && getProtocolFees(rawTrades),
      error: error ? { message: PROTOCOL_FEES_ERROR, type: 'error' } : undefined,
      isLoading,
    }),
    [rawTrades, error, isLoading],
  )
}

/** The requested page of an order's fills, sliced from the full list and enriched with timestamps. */
export function useOrderTrades(order: Order | null, offset = 0, limit = 10): Result {
  const { rawTrades, error, isLoading } = useAllOrderTrades(order)
  const [tradesTimestamps, setTradesTimestamps] = useState<TradesTimestamps>({})

  // Paging client-side: the API offsets PROD and BARN separately, so it cannot page the merged list.
  const pageTrades = useMemo(() => rawTrades?.slice(offset, offset + limit) ?? [], [rawTrades, offset, limit])

  // Fetch blocks timestamps for the visible page only
  useEffect(() => {
    if (!pageTrades.length) return

    let cancelled = false

    fetchTradesTimestamps(pageTrades)
      .then((timestamps) => {
        if (!cancelled) setTradesTimestamps(timestamps)
      })
      .catch((error) => {
        console.error('Trades timestamps fetching error: ', error)

        if (!cancelled) setTradesTimestamps({})
      })

    return (): void => {
      cancelled = true
    }
  }, [pageTrades])

  // Transform trades adding tokens and timestamps
  const trades = useMemo(() => {
    if (!order) return []

    const { buyToken, sellToken } = order

    const trades = pageTrades.map((trade) => {
      const timestamp = trade.txHash ? tradesTimestamps[trade.txHash] : undefined

      return { ...transformTrade(trade, order, timestamp), buyToken, sellToken }
    })

    // sort trades by execution time, newest first
    return trades.sort((a, b) => {
      if (a.executionTime && b.executionTime) {
        return b.executionTime > a.executionTime ? 1 : -1
      }
      return 0
    })
  }, [order, pageTrades, tradesTimestamps])

  const hasNextPage = (rawTrades?.length ?? 0) > offset + limit
  // SWR reports nothing pending without a key, but the caller is still waiting on the order itself.
  const areTradesLoading = isLoading || (!rawTrades && !error)

  return useMemo(
    () => ({ trades, error, isLoading: areTradesLoading, hasNextPage }),
    [trades, error, areTradesLoading, hasNextPage],
  )
}

async function fetchTradesTimestamps(rawTrades: RawTrade[]): Promise<TradesTimestamps> {
  const requests = rawTrades.map(({ txHash, blockNumber }) => {
    const cachedValue = tradesTimestampsCache[blockNumber]

    if (cachedValue) {
      return cachedValue.then((timestamp) => ({ txHash, timestamp }))
    }

    const request = web3.eth.getBlock(blockNumber).then(({ timestamp }) => +timestamp)

    tradesTimestampsCache[blockNumber] = request

    return request.then((timestamp) => ({ txHash, timestamp }))
  })

  const data = await Promise.all(requests)

  return data.reduce((acc, val) => {
    if (val.txHash) acc[val.txHash] = val.timestamp

    return acc
  }, {} as TradesTimestamps)
}

/** Fetches every trade of an order, skipping duplicates so they cannot inflate the fee totals. */
async function getAllOrderTrades(networkId: Network, orderId: string): Promise<RawTrade[]> {
  const allTrades: RawTrade[] = []
  const seen = new Set<string>()

  for (let page = 0; page < MAX_TRADES_PAGES; page++) {
    const trades = await getTrades({ networkId, orderId, offset: allTrades.length, limit: ALL_TRADES_PAGE_SIZE })

    // Already-collected records mean `offset` was ignored and an earlier page was re-served.
    const newTrades = trades.filter((trade) => {
      const key = `${trade.txHash}-${trade.logIndex}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    allTrades.push(...newTrades)

    // A short page is not the end: the API may cap the page size below the requested limit.
    if (newTrades.length === 0) return allTrades
  }

  throw new Error(`Reached ${MAX_TRADES_PAGES} pages of trades for order ${orderId}; the API is not paging correctly`)
}

/**
 * Every fill of an order. Both the Fills table and the fee breakdown derive from this one SWR entry,
 * so the order details page fetches the trades once however many consumers it has.
 */
function useAllOrderTrades(order: Order | null): AllTradesResult {
  // Here we assume that we are already in the right network
  // contrary to useOrder hook, where it searches all networks for a given orderId
  const networkId = useNetworkId()
  const orderUid = order?.uid

  // In the key so a new fill refetches. They change only when a fill lands, not on every poll.
  const executedSellAmount = order?.executedSellAmount.toString()
  const executedBuyAmount = order?.executedBuyAmount.toString()

  const { data, error, isLoading } = useSWR(
    networkId && orderUid ? ['allOrderTrades', networkId, orderUid, executedSellAmount, executedBuyAmount] : null,
    ([, network, uid]: [string, Network, string, ...unknown[]]) => getAllOrderTrades(network, uid),
    {
      ...SWR_NO_REFRESH_OPTIONS,
      errorRetryCount: 0,
      onError: (err: unknown) => {
        console.error(`[useAllOrderTrades] ${TRADES_ERROR}`, normalizeError(err))
      },
    },
  )

  return useMemo<AllTradesResult>(
    () => ({
      rawTrades: data,
      error: error ? { message: TRADES_ERROR, type: 'error' } : undefined,
      isLoading,
    }),
    [data, error, isLoading],
  )
}
