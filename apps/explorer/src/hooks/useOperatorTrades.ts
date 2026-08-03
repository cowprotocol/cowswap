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
  // Undefined until the fees are known: while loading, after a failed fetch, or when no order was
  // given. Callers must not treat that as "this order charged no fees" — `[]` means that.
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

// Request a large page so most orders are covered in a single call. We still page defensively
// (advancing by the number of records actually returned) in case the API serves a smaller page
// than requested.
const ALL_TRADES_PAGE_SIZE = 1000
// Safety bound in case the API stops honouring `offset`. Reaching it is an error rather than a
// truncation: 100 full pages would be 100k fills, so in practice it means the paging is broken and
// the fees we have are not to be trusted.
const MAX_TRADES_PAGES = 100

const PROTOCOL_FEES_ERROR = 'Failed to fetch the costs and fees breakdown'

/**
 * Derives the order-level protocol fee breakdown from *all* of an order's trades.
 *
 * Unlike {@link useOrderTrades} (which only holds the currently selected Fills table
 * page), this fetches every fill, so the breakdown covers the whole order and does not
 * change as the user pages through the fills.
 */
export function useOrderProtocolFees(order: Order | null): ProtocolFeesResult {
  const networkId = useNetworkId()
  const orderUid = order?.uid

  // The executed amounts are part of the cache key so a new fill refetches instead of serving the
  // breakdown from before it. They only change when a fill actually lands, not on every poll of
  // the order, so a settled order keeps hitting the same key.
  const executedSellAmount = order?.executedSellAmount.toString()
  const executedBuyAmount = order?.executedBuyAmount.toString()

  // Keying by order is also what keeps a previous order's fees from being shown as the current
  // one's: the route is `/orders/:orderId`, so searching another order swaps the param without
  // remounting, and a key it has no data for reads as "not known yet" rather than as stale data.
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
      // Distinct from useOrderTrades' message: the Fills table can load fine while this fails.
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

/**
 * Fetches every trade of an order, paging until the API runs out of results.
 *
 * Duplicates here would be silently summed into the fee totals, so the paging is deliberately
 * distrustful of the API: it skips records it has already seen, and gives up rather than returning
 * a partial list if that never terminates the loop.
 */
async function getAllOrderTrades(networkId: Network, orderId: string): Promise<RawTrade[]> {
  const allTrades: RawTrade[] = []
  const seen = new Set<string>()

  for (let page = 0; page < MAX_TRADES_PAGES; page++) {
    const trades = await getTrades({ networkId, orderId, offset: allTrades.length, limit: ALL_TRADES_PAGE_SIZE })

    // A trade is uniquely identified by where it was settled. Records we've already collected mean
    // the API ignored `offset` and re-served an earlier page, so they must not be counted twice.
    const newTrades = trades.filter((trade) => {
      const key = `${trade.txHash}-${trade.logIndex}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    allTrades.push(...newTrades)

    // Stop on an empty page, or on one that added nothing new. Deliberately *not* on a page merely
    // shorter than requested: the API is free to cap the page size below what we ask for, and
    // treating that as the end would silently drop fills. Advancing the offset by the number of
    // records actually returned handles that case; the all-duplicates check is what terminates us
    // if `offset` is being ignored.
    if (newTrades.length === 0) return allTrades
  }

  throw new Error(`Reached ${MAX_TRADES_PAGES} pages of trades for order ${orderId}; the API is not paging correctly`)
}
