import { useEffect, useMemo, useRef } from 'react'
import { useActiveWeb3React } from 'hooks'
import { useBlockNumber } from 'state/application/hooks'
import { OrderFulfillmentData, Order } from './actions'
import { Web3Provider } from '@ethersproject/providers'
import { Log, Filter } from '@ethersproject/abstract-provider'
import {
  useLastCheckedBlock,
  usePendingOrders,
  useFulfillOrdersBatch,
  useFindOrderById,
  useExpireOrdersBatch
} from './hooks'
import { buildBlock2DateMap } from 'utils/blocks'
import { delay, registerOnWindow } from 'utils/misc'
import { getOrder, OrderMetaData } from 'utils/operator'
import {
  DEFAULT_ORDER_DELAY,
  GP_SETTLEMENT_CONTRACT_ADDRESS,
  SHORT_PRECISION,
  EXPIRED_ORDERS_BUFFER,
  CHECK_EXPIRED_ORDERS_INTERVAL
} from 'constants/index'
import { GP_V2_SETTLEMENT_INTERFACE } from 'constants/GPv2Settlement'
import { stringToCurrency } from '../swap/extension'

type OrderLogPopupMixData = OrderFulfillmentData & Pick<Log, 'transactionHash'> & Partial<Pick<Order, 'summary'>>

const TradeEvent = GP_V2_SETTLEMENT_INTERFACE.getEvent('Trade')

interface TradeEventParams {
  owner: string // address
  // maybe enable when orderUid is indexed
  // id?: string | string[] // to filter by id
}

function _computeFulfilledSummary({
  orderFromStore,
  orderFromApi
}: {
  orderFromStore?: Order
  orderFromApi: OrderMetaData | null
}) {
  // Default to store's current order summary
  let summary: string | undefined = orderFromStore?.summary

  // if we can find the order from the API
  // and our specific order exists in our state, let's use that
  if (orderFromApi && Number(orderFromApi.executedBuyAmount) > 0 && Number(orderFromApi.executedSellAmount) > 0) {
    const { buyToken, sellToken, executedBuyAmount, executedSellAmount } = orderFromApi

    if (orderFromStore) {
      const { inputToken, outputToken } = orderFromStore
      // don't show amounts in atoms
      const inputAmount = stringToCurrency(executedSellAmount, inputToken)
      const outputAmount = stringToCurrency(executedBuyAmount, outputToken)

      summary = `Swap ${inputAmount.toSignificant(SHORT_PRECISION)} ${
        inputAmount.currency.symbol
      } for ${outputAmount.toSignificant(SHORT_PRECISION)} ${outputAmount.currency.symbol}`
    } else {
      // We only have the API order info, let's at least use that
      summary = `Swap ${sellToken} for ${buyToken}`
    }
  } else {
    console.log(`[state:orders:updater] computeFulfilledSummary::API data not yet in sync with blockchain`)
  }

  return summary
}

const generateTradeEventTopics = ({ owner /*, id */ }: TradeEventParams) => {
  const TradeEventTopics = GP_V2_SETTLEMENT_INTERFACE.encodeFilterTopics(TradeEvent, [owner /*, id*/])
  return TradeEventTopics
}

const decodeTradeEvent = (tradeEventLog: Log) => {
  return GP_V2_SETTLEMENT_INTERFACE.decodeEventLog(TradeEvent, tradeEventLog.data, tradeEventLog.topics)
}

type RetryFilter = Filter & { fromBlock: number; toBlock: number }

const constructGetLogsRetry = (provider: Web3Provider) => {
  // tries fetching logs
  // if breaks, retries on half the range
  const getLogsRetry = async ({ fromBlock, toBlock, ...rest }: RetryFilter): Promise<Log[]> => {
    try {
      console.log(`EventUpdater::Getting logs fromBlock: ${fromBlock} toBlock ${toBlock}`)
      const logs = await provider.getLogs({
        fromBlock,
        toBlock,
        ...rest
      })
      // console.log('logs', logs)
      return logs
    } catch (error) {
      console.error(`Error getting logs fromBlock: ${fromBlock} toBlock ${toBlock}`, error)

      // expect -- RPC Error: query returned more than 10000 results --
      // if a different error - rethrow
      if (!error?.message?.includes('query returned more than')) throw error

      // still too many logs in 1 block
      // rethrow
      // but this shouldn't happen
      if (toBlock === fromBlock) {
        console.error(`Too many logs in block ${toBlock}. Aborting`)
        throw error
      }

      const midBlock = Math.floor((toBlock + fromBlock) / 2)

      const [beforeMidLogs, afterMidLogs] = await Promise.all([
        getLogsRetry({
          fromBlock,
          toBlock: midBlock
        }),
        getLogsRetry({
          fromBlock: midBlock + 1,
          toBlock
        })
      ])

      return beforeMidLogs.concat(afterMidLogs)
    }
  }

  return getLogsRetry
}

export function EventUpdater(): null {
  const { account, chainId, library } = useActiveWeb3React()
  // console.log('EventUpdater::library', library)
  // console.log('EventUpdater::chainId', chainId)

  const lastBlockNumber = useBlockNumber()
  const lastCheckedBlock = useLastCheckedBlock({ chainId })
  console.log('EventUpdater::lastCheckedBlock', lastCheckedBlock)
  console.log('EventUpdater::lastBlockNumber', lastBlockNumber)

  const fulfillOrdersBatch = useFulfillOrdersBatch()

  const getLogsRetry = useMemo(() => {
    if (!library) return null
    return constructGetLogsRetry(library)
  }, [library])

  const eventTopics = useMemo(() => {
    if (!account) return null
    return generateTradeEventTopics({ owner: account })
  }, [account])

  const contractAddress = chainId && GP_SETTLEMENT_CONTRACT_ADDRESS[chainId]

  const findOrderById = useFindOrderById({ chainId })

  useEffect(() => {
    if (!chainId || !library || !getLogsRetry || !lastBlockNumber || !eventTopics || !contractAddress) return

    registerOnWindow({
      getLogsRetry: (fromBlock: number, toBlock: number) => {
        // to play around with in console
        return getLogsRetry({
          fromBlock,
          toBlock,
          topics: eventTopics
        })
      }
    })

    // don't check for fromBlock > toBlock
    if (lastCheckedBlock + 1 > lastBlockNumber) return

    const getPastEvents = async () => {
      console.log('EventUpdater::getLogs', {
        fromBlock: lastCheckedBlock + 1,
        toBlock: lastBlockNumber,
        address: contractAddress,
        topics: eventTopics
      })

      const logs = await getLogsRetry({
        fromBlock: lastCheckedBlock + 1,
        toBlock: lastBlockNumber,
        address: contractAddress,
        topics: eventTopics
      })

      const block2DateMap = await buildBlock2DateMap(library, logs)

      // Filter out orders that should not trigger a pop-up
      const pendingLogsAndOrders = logs.reduce<[Log, Order][]>((acc, log) => {
        const { orderUid: id } = decodeTradeEvent(log)

        console.log(`EventUpdater::Detected Trade event for order ${id} of token in block`, log.blockNumber)

        const orderFromStore = findOrderById(id)
        if (!orderFromStore || orderFromStore.status !== 'pending') {
          console.log(`EventUpdater::Order ${id} not pending or not on local storage, ignoring it`)
          return acc
        }

        acc.push([log, orderFromStore])

        return acc
      }, [])

      const ordersBatchData: OrderLogPopupMixData[] = await Promise.all(
        pendingLogsAndOrders.map(async ([log, orderFromStore]) => {
          const id = orderFromStore.id

          // We've found the orderId in the Trade event
          // But the backend may not be completely updated yet, e.g
          // the frontend is ahead of the backend in regards to data freshness
          // TODO: temporary! change to a better solution
          // https://github.com/gnosis/gp-swap-ui/issues/213
          const orderFromApi = await delay(DEFAULT_ORDER_DELAY, getOrder(chainId, id))

          // using order from store and api compute summary
          const summary = _computeFulfilledSummary({ orderFromApi, orderFromStore })

          return {
            id,
            fulfillmentTime: block2DateMap[log.blockHash].toISOString(),
            transactionHash: log.transactionHash,
            summary
          }
        })
      )

      // SET lastCheckedBlock = lastBlockNumber
      // AND fulfill orders
      // ordersBatchData can be empty
      fulfillOrdersBatch({
        ordersData: ordersBatchData,
        chainId,
        lastCheckedBlock: lastBlockNumber
      })

      // console.log('logs', logs)

      // TODO: extend addPopup to accept whatever we want to show for Orders
      // if (logs.length > 0) {
      //   const firstBlock = logs[0].blockNumber
      //   const lastBlock = logs[logs.length - 1].blockNumber

      //   const blocksRangeStr = firstBlock === lastBlock ? `block ${firstBlock}` : `blocks ${firstBlock} - ${lastBlock}`
      //   // Sample popup for events
      //   addPopup(
      //     {
      //       txn: {
      //         hash: logs[0].transactionHash,
      //         success: true,
      //         summary: `EventUpdater::Detected ${logs.length} token Transfers in ${blocksRangeStr}`
      //       }
      //     },
      //     logs[0].transactionHash
      //   )
      // }
    }

    getPastEvents()
  }, [
    chainId,
    library,
    lastBlockNumber,
    lastCheckedBlock,
    getLogsRetry,
    eventTopics,
    fulfillOrdersBatch,
    contractAddress,
    findOrderById
  ])

  // TODO: maybe implement event watching instead of getPastEvents on every block
  // useEffect(() => {
  //   if (!chainId || !library || !lastBlockNumber) return

  //   const listener = (log: Log) => {
  //     console.log('Transfer::log', log) // the log isn't decoded, if used through contract, can have decoded already

  //     // decode manually for now
  //     const { from, to, amount } = decodeTransferEvent(log)

  //     console.log('Detected transfer of token', log.address, { from, to, amount })
  //   }
  //   library.on(TransferEventTopics, listener)

  //   return () => {
  //     library.off(TransferEventTopics, listener)
  //   }
  // }, [chainId, library])

  return null
}

export function ExpiredOrdersWatcher(): null {
  const { chainId } = useActiveWeb3React()

  const expireOrdersBatch = useExpireOrdersBatch()

  const pendingOrders = usePendingOrders({ chainId })

  // ref, so we don't rerun useEffect
  const pendingOrdersRef = useRef(pendingOrders)
  pendingOrdersRef.current = pendingOrders

  useEffect(() => {
    if (!chainId) return

    const checkForExpiredOrders = () => {
      // no more pending orders
      // but don't clearInterval so we can restart when there are new orders
      if (pendingOrdersRef.current.length === 0) return

      const expiredOrders = pendingOrdersRef.current.filter(order => {
        // validTo is either a Date or unix timestamp in seconds
        const validTo = typeof order.validTo === 'number' ? new Date(order.validTo * 1000) : order.validTo

        // let's get the current date, with our expired order validTo given a buffer time
        return Date.now() - validTo.valueOf() > EXPIRED_ORDERS_BUFFER
      })

      const expiredIds = expiredOrders.map(({ id }) => id)

      expireOrdersBatch({
        chainId,
        ids: expiredIds
      })
    }

    const intervalId = setInterval(checkForExpiredOrders, CHECK_EXPIRED_ORDERS_INTERVAL)

    return () => clearInterval(intervalId)
  }, [chainId, expireOrdersBatch])

  return null
}
