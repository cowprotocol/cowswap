import { useCallback, useEffect, useRef } from 'react'
import { useActiveWeb3React } from 'hooks'
import { OrderFulfillmentData, Order } from './actions'
import {
  usePendingOrders,
  useFulfillOrdersBatch,
  useExpireOrdersBatch,
  useCancelOrdersBatch,
  useCancelledOrders
} from './hooks'
import { getOrder, OrderID, OrderMetaData } from 'utils/operator'
import { CANCELLED_ORDERS_PENDING_TIME, SHORT_PRECISION } from 'constants/index'
import { stringToCurrency } from '../swap/extension'
import { OPERATOR_API_POLL_INTERVAL } from './consts'
import { ChainId } from '@uniswap/sdk'
import { ApiOrderStatus, classifyOrder } from './utils'

type OrderLogPopupMixData = OrderFulfillmentData | OrderID

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
  if (orderFromApi) {
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

type PopupData = {
  status: ApiOrderStatus
  popupData?: OrderLogPopupMixData
}

async function fetchOrderPopupData(orderFromStore: Order, chainId: ChainId): Promise<PopupData> {
  const orderFromApi = await getOrder(chainId, orderFromStore.id)

  const status = classifyOrder(orderFromApi)

  let popupData = undefined

  switch (status) {
    case 'fulfilled':
      popupData = {
        id: orderFromStore.id,
        fulfillmentTime: new Date().toISOString(),
        transactionHash: '', // there's no need  for a txHash as we'll link the notification to the Explorer
        summary: _computeFulfilledSummary({ orderFromStore, orderFromApi })
      }
      break
    case 'expired':
    case 'cancelled':
      popupData = orderFromStore.id
      break
    default:
      // No popup for other states
      break
  }

  return { status, popupData }
}

export function EventUpdater(): null {
  const { chainId } = useActiveWeb3React()

  const pending = usePendingOrders({ chainId })

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const fulfillOrdersBatch = useFulfillOrdersBatch()
  const expireOrdersBatch = useExpireOrdersBatch()
  const cancelOrdersBatch = useCancelOrdersBatch()

  const updateOrders = useCallback(
    async (chainId: ChainId) => {
      // Exit early when there are no pending orders
      if (pendingRef.current.length === 0) {
        return
      }

      // Iterate over pending orders fetching operator order data, async
      const unfilteredOrdersData = await Promise.all(
        pendingRef.current.map(async orderFromStore => fetchOrderPopupData(orderFromStore, chainId))
      )

      // Group resolved promises by status
      // Only pick the status that are final
      const { fulfilled, expired, cancelled } = unfilteredOrdersData.reduce<
        Record<ApiOrderStatus, OrderLogPopupMixData[]>
      >(
        (acc, { status, popupData }) => {
          popupData && acc[status].push(popupData)
          return acc
        },
        { fulfilled: [], expired: [], cancelled: [], unknown: [], pending: [] }
      )

      // Bach state update per group, if any

      fulfilled.length > 0 &&
        fulfillOrdersBatch({
          ordersData: fulfilled as OrderFulfillmentData[],
          chainId
        })
      expired.length > 0 &&
        expireOrdersBatch({
          ids: expired as OrderID[],
          chainId
        })
      cancelled.length > 0 &&
        cancelOrdersBatch({
          ids: cancelled as OrderID[],
          chainId
        })
    },
    [cancelOrdersBatch, expireOrdersBatch, fulfillOrdersBatch]
  )

  useEffect(() => {
    if (!chainId) {
      return
    }

    const interval = setInterval(() => updateOrders(chainId), OPERATOR_API_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [chainId, updateOrders])

  return null
}

/**
 * Updater for cancelled orders.
 *
 * Similar to Event updater, but instead of watching pending orders, it watches orders that have been cancelled
 * in the last 5 min.
 *
 * Whenever an order that was cancelled but has since been fulfilled, trigger a state update
 * and a popup notification, changing the status from cancelled to fulfilled.
 *
 * It's supposed to fix race conditions between the api accepting a cancellation while a solution was already
 * submitted to the network by a solver.
 * Due to the network's nature, we can't tell whether an order has been really cancelled, so we prefer to wait a short
 * period and say it's cancelled even though in some cases it might actually be filled.
 */
export function CancelledOrdersUpdater(): null {
  const { chainId } = useActiveWeb3React()

  const cancelled = useCancelledOrders({ chainId })

  // Ref, so we don't rerun useEffect
  const cancelledRef = useRef(cancelled)
  cancelledRef.current = cancelled

  const fulfillOrdersBatch = useFulfillOrdersBatch()

  const updateOrders = useCallback(
    async (chainId: ChainId) => {
      // Filter orders created in the last 5 min, no further
      const pending = cancelledRef.current.filter(
        order => Date.now() - new Date(order.creationTime).getTime() < CANCELLED_ORDERS_PENDING_TIME
      )

      if (pending.length === 0) {
        return
      }

      // Iterate over pending orders fetching operator order data, async
      const unfilteredOrdersData = await Promise.all(
        pending.map(async orderFromStore => fetchOrderPopupData(orderFromStore, chainId))
      )

      // Group resolved promises by status
      // Only pick fulfilled
      const { fulfilled } = unfilteredOrdersData.reduce<Record<ApiOrderStatus, OrderLogPopupMixData[]>>(
        (acc, { status, popupData }) => {
          popupData && acc[status].push(popupData)
          return acc
        },
        { fulfilled: [], expired: [], cancelled: [], unknown: [], pending: [] }
      )

      // Bach state update fulfilled orders, if any
      fulfilled.length > 0 &&
        fulfillOrdersBatch({
          ordersData: fulfilled as OrderFulfillmentData[],
          chainId
        })
    },
    [fulfillOrdersBatch]
  )

  useEffect(() => {
    if (!chainId) {
      return
    }

    const interval = setInterval(() => updateOrders(chainId), OPERATOR_API_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [chainId, updateOrders])

  return null
}
