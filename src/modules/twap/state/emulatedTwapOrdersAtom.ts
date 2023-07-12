import { atom } from 'jotai'

import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { computeOrderSummary } from 'legacy/state/orders/updaters/utils'

import { tokensByAddressAtom } from 'modules/tokensList/state/tokensListAtom'
import { walletInfoAtom } from 'modules/wallet/api/state'

import { openTwapOrdersAtom } from './twapOrdersListAtom'

import { TwapOrderStatus } from '../types'
import { emulateTwapAsOrder } from '../utils/emulateTwapAsOrder'

const statusesMap: Record<TwapOrderStatus, OrderStatus> = {
  [TwapOrderStatus.Cancelled]: OrderStatus.CANCELLED,
  [TwapOrderStatus.Expired]: OrderStatus.EXPIRED,
  [TwapOrderStatus.Pending]: OrderStatus.PENDING,
  [TwapOrderStatus.WaitSigning]: OrderStatus.PRESIGNATURE_PENDING,
  [TwapOrderStatus.Fulfilled]: OrderStatus.FULFILLED,
  [TwapOrderStatus.Cancelling]: OrderStatus.PENDING,
}

export const emulatedTwapOrdersAtom = atom((get) => {
  const { account, chainId } = get(walletInfoAtom)
  const openOrders = get(openTwapOrdersAtom)
  const tokensByAddress = get(tokensByAddressAtom)
  const accountLowerCase = account?.toLowerCase()

  if (!accountLowerCase) return []

  const orderWithComposableCowInfo: Order[] = openOrders
    .filter((order) => order.chainId === chainId && order.safeAddress.toLowerCase() === accountLowerCase)
    .map((order) => {
      const enrichedOrder = emulateTwapAsOrder(order)
      const status = statusesMap[order.status]

      const storeOrder: Order = {
        ...enrichedOrder,
        id: enrichedOrder.uid,
        composableCowInfo: {
          id: order.id,
          status,
        },
        sellAmountBeforeFee: enrichedOrder.sellAmount,
        inputToken: tokensByAddress[enrichedOrder.sellToken.toLowerCase()],
        outputToken: tokensByAddress[enrichedOrder.buyToken.toLowerCase()],
        creationTime: enrichedOrder.creationDate,
        summary: '',
        status,
        apiAdditionalInfo: enrichedOrder,
        isCancelling: order.status === TwapOrderStatus.Cancelling,
      }

      const summary = computeOrderSummary({ orderFromStore: storeOrder, orderFromApi: enrichedOrder })

      storeOrder.summary = summary || ''

      return storeOrder
    })

  return orderWithComposableCowInfo
})
