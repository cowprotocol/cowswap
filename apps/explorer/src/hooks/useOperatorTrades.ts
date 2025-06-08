import { useCallback, useEffect, useMemo, useState } from 'react'

import { useNetworkId } from 'state/network'
import { Network, UiError } from 'types'
import { transformTrade } from 'utils'

import { getTrades, Order, RawTrade, Trade } from 'api/operator'

import { web3 } from '../explorer/api'

type Result = {
  trades: Trade[]
  error?: UiError
  isLoading: boolean
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
// eslint-disable-next-line max-lines-per-function
export function useOrderTrades(order: Order | null): Result {
  const [error, setError] = useState<UiError>()
  const [trades, setTrades] = useState<Trade[]>([])
  const [rawTrades, setRawTrades] = useState<RawTrade[] | null>(null)
  const [tradesTimestamps, setTradesTimestamps] = useState<TradesTimestamps>({})

  // Here we assume that we are already in the right network
  // contrary to useOrder hook, where it searches all networks for a given orderId
  const networkId = useNetworkId()

  const fetchTrades = useCallback(
    async (controller: AbortController, _networkId: Network): Promise<void> => {
      if (!order) return

      const { uid: orderId } = order

      try {
        const trades = await getTrades({ networkId: _networkId, orderId })

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
    [order]
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

    // Reverse trades, to show the newest on top
    setTrades(trades.reverse())
  }, [order, rawTrades, tradesTimestamps])

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

  return useMemo(() => ({ trades, error, isLoading }), [trades, error, isLoading])
}
