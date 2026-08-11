import { useCallback, useEffect, useMemo, useState } from 'react'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'

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

type ProtocolFeesResult = {
  // Undefined while unknown (loading, failed, or no order); `[]` means no fee was charged.
  protocolFees?: ProtocolFee[]
  error?: UiError
  isLoading: boolean
}

export function useOrderTrades(order: Order | null, offset = 0, limit = 10): Result {
  const [error, setError] = useState<UiError>()
  const [trades, setTrades] = useState<Trade[]>([])
  const [rawTrades, setRawTrades] = useState<RawTrade[] | null>(null)
  const [tradesTimestamps, setTradesTimestamps] = useState<TradesTimestamps>({})
  const [hasNextPage, setHasNextPage] = useState(false)

  // Here we assume that we are already in the right network
  // contrary to useOrder hook, where it searches all networks for a given orderId
  const networkId = useNetworkId()

  const fetchTrades = useCallback(
    async (controller: AbortController, _networkId: Network): Promise<void> => {
      if (!order) return

      const { uid: orderId } = order

      try {
        const trades = await getTrades({ networkId: _networkId, orderId, offset, limit: limit + 1 })

        if (controller.signal.aborted) return

        setRawTrades(trades)
        setError(undefined)
      } catch (e) {
        const msg = `Failed to fetch trades`
        console.error(msg, e)

        setRawTrades([])
        setError({ message: msg, type: 'error' })
      }
    },
    [order, offset, limit],
  )

  // Fetch blocks timestamps for trades
  useEffect(() => {
    if (!rawTrades) return

    fetchTradesTimestamps(rawTrades)
      .then(setTradesTimestamps)
      .catch((error) => {
        console.error('Trades timestamps fetching error: ', error)

        setTradesTimestamps({})
      })
  }, [rawTrades])

  // Transform trades adding tokens and timestamps
  useEffect(() => {
    if (!order || !rawTrades) return

    const { buyToken, sellToken } = order

    const trades = rawTrades.map((trade) => {
      const timestamp = trade.txHash ? tradesTimestamps[trade.txHash] : undefined

      return { ...transformTrade(trade, order, timestamp), buyToken, sellToken }
    })

    // sort trades by execution time, newest first
    trades.sort((a, b) => {
      if (a.executionTime && b.executionTime) {
        return b.executionTime > a.executionTime ? 1 : -1
      }
      return 0
    })

    const hasNext = trades.length > limit
    setHasNextPage(hasNext)

    setTrades(hasNext ? trades.slice(0, limit) : trades)
  }, [order, rawTrades, tradesTimestamps, limit])

  const executedSellAmount = order?.executedSellAmount.toString()
  const executedBuyAmount = order?.executedBuyAmount.toString()

  useEffect(() => {
    if (!networkId || !order?.uid) {
      return
    }

    const controller = new AbortController()

    fetchTrades(controller, networkId)
    return (): void => controller.abort()
    // Depending on order UID to avoid re-fetching when obj changes but ID remains the same
    // Depending on `executedBuy/SellAmount`s string to force a refetch when there are new trades
    // using the string version because hooks are bad at detecting Object changes
  }, [fetchTrades, networkId, order?.uid, executedSellAmount, executedBuyAmount])

  const isLoading = rawTrades === null

  return useMemo(() => ({ trades, error, isLoading, hasNextPage }), [trades, error, isLoading, hasNextPage])
}

// Large enough that most orders need a single call.
const ALL_TRADES_PAGE_SIZE = 1000
// Safety bound; reaching it means the paging is broken, not that the order has this many fills.
const MAX_TRADES_PAGES = 100

const PROTOCOL_FEES_ERROR = 'Failed to fetch the costs and fees breakdown'

/**
 * Order-level fee breakdown, derived from every fill. Unlike {@link useOrderTrades}, which is
 * scoped to the selected Fills page, this does not change as the user pages.
 */
export function useOrderProtocolFees(order: Order | null): ProtocolFeesResult {
  const networkId = useNetworkId()
  const orderUid = order?.uid

  // In the key so a new fill refetches. They change only when a fill lands, not on every poll.
  const executedSellAmount = order?.executedSellAmount.toString()
  const executedBuyAmount = order?.executedBuyAmount.toString()

  const { data, error, isLoading } = useSWR(
    networkId && orderUid ? ['orderProtocolFees', networkId, orderUid, executedSellAmount, executedBuyAmount] : null,
    async ([, network, uid]: [string, Network, string, ...unknown[]]) =>
      getProtocolFees(await getAllOrderTrades(network, uid)),
    {
      ...SWR_NO_REFRESH_OPTIONS,
      errorRetryCount: 0,
      onError: (e) => console.error(`[useOrderProtocolFees] ${PROTOCOL_FEES_ERROR}`, e),
    },
  )

  return useMemo<ProtocolFeesResult>(
    () => ({
      protocolFees: data,
      error: error ? { message: PROTOCOL_FEES_ERROR, type: 'error' } : undefined,
      isLoading,
    }),
    [data, error, isLoading],
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
