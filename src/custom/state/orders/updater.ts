import { useCallback, useEffect, useRef } from 'react'
import { useActiveWeb3React } from 'hooks'
import { OrderFulfillmentData, Order } from './actions'
import { Log } from '@ethersproject/abstract-provider'
import { usePendingOrders, useFulfillOrdersBatch, useExpireOrdersBatch } from './hooks'
import { getOrder, OrderMetaData } from 'utils/operator'
import { SHORT_PRECISION, EXPIRED_ORDERS_BUFFER, CHECK_EXPIRED_ORDERS_INTERVAL } from 'constants/index'
import { stringToCurrency } from '../swap/extension'
import { OPERATOR_API_POLL_INTERVAL } from './consts'
import { ChainId } from '@uniswap/sdk'

type OrderLogPopupMixData = OrderFulfillmentData & Pick<Log, 'transactionHash'> & Partial<Pick<Order, 'summary'>>

function isOrderFinalized(orderFromApi: OrderMetaData | null): boolean {
  return (
    orderFromApi !== null && Number(orderFromApi.executedBuyAmount) > 0 && Number(orderFromApi.executedSellAmount) > 0
  )
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
  if (orderFromApi && isOrderFinalized(orderFromApi)) {
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

async function fetchOrderPopupData(orderFromStore: Order, chainId: ChainId): Promise<OrderLogPopupMixData | null> {
  const orderFromApi = await getOrder(chainId, orderFromStore.id)

  if (!isOrderFinalized(orderFromApi)) {
    return null
  }

  const summary = _computeFulfilledSummary({ orderFromStore, orderFromApi })

  return {
    id: orderFromStore.id,
    fulfillmentTime: new Date().toISOString(),
    transactionHash: '', // there's no need  for a txHash as we'll link the notification to the Explorer
    summary
  }
}

export function EventUpdater(): null {
  const { chainId } = useActiveWeb3React()

  const pending = usePendingOrders({ chainId })
  const fulfillOrdersBatch = useFulfillOrdersBatch()

  const updateOrders = useCallback(
    async (pending: Order[], chainId: ChainId) => {
      // Iterate over pending orders fetching operator order data, async
      // Returns a null when the order isn't finalized/not found
      const unfilteredOrdersData: (OrderLogPopupMixData | null)[] = await Promise.all(
        pending.map(async orderFromStore => fetchOrderPopupData(orderFromStore, chainId))
      )

      // Additional step filtering out `null` entries, due to lack of async reduce
      // Type guard is required to tell TS what's the final type
      const ordersData = unfilteredOrdersData.filter((data): data is OrderLogPopupMixData => data !== null)

      fulfillOrdersBatch({
        ordersData,
        chainId
      })
    },
    [fulfillOrdersBatch]
  )

  useEffect(() => {
    if (!chainId || pending.length <= 0) {
      return
    }

    const interval = setInterval(() => updateOrders(pending, chainId), OPERATOR_API_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [pending, chainId, updateOrders])

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
