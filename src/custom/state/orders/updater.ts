import { useEffect, useMemo, useRef } from 'react'
import { useDispatch, batch } from 'react-redux'
import { useActiveWeb3React } from 'hooks'
import { useAddPopup, useBlockNumber } from 'state/application/hooks'
import { AppDispatch } from 'state'
import { OrderFulfillmentData } from './actions'
import { utils } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import { Log, Filter } from '@ethersproject/abstract-provider'
import { useLastCheckedBlock, usePendingOrders, useExpireOrder, useFulfillOrdersBatch } from './hooks'
import { buildBlock2DateMap } from 'utils/blocks'
import { registerOnWindow } from 'utils/misc'
// import { PartialOrdersMap } from './reducer'

// example of event watching + decoding without contract
const transferEventAbi = 'event Transfer(address indexed from, address indexed to, uint amount)'
const ERC20Interface = new utils.Interface([transferEventAbi])

const TransferEvent = ERC20Interface.getEvent('Transfer')

const TransferEventTopics = ERC20Interface.encodeFilterTopics(TransferEvent, [])

// const decodeTransferEvent = (transferEventLog: Log) => {
//   return ERC20Interface.decodeEventLog(TransferEvent, transferEventLog.data, transferEventLog.topics)
// }

// TODO sync with contracts
const tradeEventAbi =
  'event Trade(address indexed owner, IERC20 sellToken, IERC20 buyToken, uint256 sellAmount, uint256 buyAmount, uint256 feeAmount, bytes orderUid)'
const TradeSettlementInterface = new utils.Interface([tradeEventAbi])

const TradeEvent = TradeSettlementInterface.getEvent('Trade')

interface TradeEventParams {
  owner: string // address
  id?: string | string[] // to filter by id
}

const generateTradeEventTopics = ({ owner /*, id */ }: TradeEventParams) => {
  const TradeEventTopics = TradeSettlementInterface.encodeFilterTopics(TradeEvent, [owner /*, id*/])
  return TradeEventTopics
}

const decodeTradeEvent = (tradeEventLog: Log) => {
  return TradeSettlementInterface.decodeEventLog(TradeEvent, tradeEventLog.data, tradeEventLog.topics)
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

  const dispatch = useDispatch<AppDispatch>()

  const fulfillOrdersBatch = useFulfillOrdersBatch()

  // show popup on confirm
  // for displaying fulfilled orders
  const addPopup = useAddPopup()

  const getLogsRetry = useMemo(() => {
    if (!library) return null
    return constructGetLogsRetry(library)
  }, [library])

  const eventTopics = useMemo(() => {
    if (!account) return null
    return generateTradeEventTopics({ owner: account })
  }, [account])

  useEffect(() => {
    if (!chainId || !library || !getLogsRetry || !lastBlockNumber || !eventTopics) return

    registerOnWindow({
      getLogsRetry: (fromBlock: number, toBlock: number) => {
        // to play around with in console
        return getLogsRetry({
          fromBlock,
          toBlock,
          topics: TransferEventTopics
        })
      }
    })

    // don't check for fromBlock > toBlock
    if (lastCheckedBlock + 1 > lastBlockNumber) return

    const getPastEvents = async () => {
      console.log('EventUpdater::getLogs', {
        fromBlock: lastCheckedBlock + 1,
        toBlock: lastBlockNumber,
        // address: '0x', // TODO: get address from networks.json or somewhere else
        topics: eventTopics
      })

      const logs = await getLogsRetry({
        fromBlock: lastCheckedBlock + 1,
        toBlock: lastBlockNumber,
        // address: '0x', // TODO: get address from networks.json or somewhere else
        topics: eventTopics
      })

      const block2DateMap = await buildBlock2DateMap(library, logs)

      const ordersBatchData: (OrderFulfillmentData & Pick<Log, 'transactionHash'>)[] = logs.map(log => {
        const { orderUid: id } = decodeTradeEvent(log)

        console.log(`EventUpdater::Detected Trade event for order ${id} of token in block`, log.blockNumber)

        return {
          id,
          fulfillmentTime: block2DateMap[log.blockHash].toISOString(),
          transactionHash: log.transactionHash
        }
      })

      batch(() => {
        // SET lastCheckedBlock = lastBlockNumber
        // AND fulfill orders
        // ordersBatchData can be empty
        fulfillOrdersBatch({
          ordersData: ordersBatchData,
          chainId,
          lastCheckedBlock
        })
        ordersBatchData.forEach(({ id, transactionHash }) => {
          try {
            addPopup(
              {
                txn: {
                  hash: transactionHash,
                  success: true,
                  summary: `Order ${id} was traded`
                }
              },
              transactionHash
            )
          } catch (error) {
            console.error('Error decoding Trade event', error)
          }
        })
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
    dispatch,
    addPopup,
    eventTopics,
    fulfillOrdersBatch
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

const CHECK_EXPIRED_ORDERS_INTERVAL = 10000 // 10 sec

export function ExpiredOrdersWatcher(): null {
  const { chainId } = useActiveWeb3React()

  const expireOrder = useExpireOrder()

  const pendingOrders = usePendingOrders({ chainId })

  // ref, so we don't rerun useEffect
  const pendingOrdersRef = useRef(pendingOrders)
  pendingOrdersRef.current = pendingOrders

  // for displaying expired orders
  const addPopup = useAddPopup()

  useEffect(() => {
    if (!chainId) return

    const checkForExpiredOrders = () => {
      // no more pending orders
      // but don't clearInterval so we can restart when there are new orders
      if (pendingOrdersRef.current.length === 0) return

      const now = new Date()
      const expiredOrders = pendingOrdersRef.current.filter(order => {
        // validTo is either a Date or unix timestamp in seconds
        const validTo = typeof order.validTo === 'number' ? new Date(order.validTo * 1000) : order.validTo

        return validTo < now
      })

      batch(() => {
        expiredOrders.forEach(order => {
          expireOrder({ chainId, id: order.id })

          addPopup(
            {
              txn: {
                hash: order.id,
                success: false,
                summary: order.summary + ' expired' || `Order ${order.id} expired`
              }
            },
            order.id + '_expired' // to differentiate further
          )
        })
      })
    }

    const intervalId = setInterval(checkForExpiredOrders, CHECK_EXPIRED_ORDERS_INTERVAL)

    return () => clearInterval(intervalId)
  }, [chainId, expireOrder, addPopup])

  return null
}
