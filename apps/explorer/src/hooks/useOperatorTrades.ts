import { useCallback, useEffect, useMemo, useState } from 'react'

import { useNetworkId } from 'state/network'
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

/**
 * Fetches trades for given order
 */
// TODO: Break down this large function into smaller functions

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

type ProtocolFeesResult = {
  protocolFees: ProtocolFee[]
  error?: UiError
  isLoading: boolean
}

// Request a large page so most orders are covered in a single call. We still page
// defensively (advancing by the number of records actually returned) in case the
// API serves a smaller page than requested, so we never silently truncate.
const ALL_TRADES_PAGE_SIZE = 1000
// Safety bound to avoid an unbounded loop if the API ever stops honouring `offset`.
const MAX_TRADES_PAGES = 100

/**
 * Fetches every trade of an order, paging until the API runs out of results.
 */
async function getAllOrderTrades(networkId: Network, orderId: string, signal: AbortSignal): Promise<RawTrade[]> {
  const allTrades: RawTrade[] = []

  for (let page = 0; page < MAX_TRADES_PAGES; page++) {
    if (signal.aborted) return allTrades

    const trades = await getTrades({ networkId, orderId, offset: allTrades.length, limit: ALL_TRADES_PAGE_SIZE })

    // A short/empty page means we've reached the end. Advancing the offset by the
    // amount actually returned keeps this correct even if the API caps the page size.
    if (trades.length === 0) return allTrades

    allTrades.push(...trades)
  }

  console.warn(
    `[getAllOrderTrades] Reached ${MAX_TRADES_PAGES} pages for order ${orderId}; protocol fees may be incomplete`,
  )

  return allTrades
}

/**
 * Derives the order-level protocol fee breakdown from *all* of an order's trades.
 *
 * Unlike {@link useOrderTrades} (which only holds the currently selected Fills table
 * page), this fetches every fill, so the breakdown covers the whole order and does not
 * change as the user pages through the fills.
 */
export function useOrderProtocolFees(order: Order | null): ProtocolFeesResult {
  const [rawTrades, setRawTrades] = useState<RawTrade[] | null>(null)
  const [error, setError] = useState<UiError>()
  const networkId = useNetworkId()

  const executedSellAmount = order?.executedSellAmount.toString()
  const executedBuyAmount = order?.executedBuyAmount.toString()

  useEffect(() => {
    if (!networkId || !order?.uid) return

    const controller = new AbortController()

    getAllOrderTrades(networkId, order.uid, controller.signal)
      .then((trades) => {
        if (controller.signal.aborted) return

        setRawTrades(trades)
        setError(undefined)
      })
      .catch((e) => {
        if (controller.signal.aborted) return

        const msg = `Failed to fetch trades`
        console.error(`[useOrderProtocolFees] ${msg}`, e)

        setRawTrades([])
        setError({ message: msg, type: 'error' })
      })

    return (): void => controller.abort()
    // Depending on order UID to avoid re-fetching when obj changes but ID remains the same.
    // Depending on `executedBuy/SellAmount`s string to force a refetch when there are new fills.
  }, [networkId, order?.uid, executedSellAmount, executedBuyAmount])

  const protocolFees = useMemo(() => getProtocolFees(rawTrades ?? []), [rawTrades])
  const isLoading = rawTrades === null

  return useMemo(() => ({ protocolFees, error, isLoading }), [protocolFees, error, isLoading])
}
