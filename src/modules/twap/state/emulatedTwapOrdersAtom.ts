import { atom } from 'jotai'

import { OrderStatus } from 'legacy/state/orders/actions'

import { walletInfoAtom } from 'modules/wallet/api/state'

import { OrderWithComposableCowInfo } from 'common/types'

import { twapOrdersListAtom } from './twapOrdersListAtom'

import { TwapOrderStatus } from '../types'
import { emulateTwapAsOrder } from '../utils/emulateTwapAsOrder'

const statusesMap: Record<TwapOrderStatus, OrderStatus> = {
  [TwapOrderStatus.Cancelled]: OrderStatus.CANCELLED,
  [TwapOrderStatus.Expired]: OrderStatus.EXPIRED,
  [TwapOrderStatus.Pending]: OrderStatus.PENDING,
  [TwapOrderStatus.Scheduled]: OrderStatus.SCHEDULED,
  [TwapOrderStatus.WaitSigning]: OrderStatus.PRESIGNATURE_PENDING,
  [TwapOrderStatus.Fulfilled]: OrderStatus.FULFILLED,
  [TwapOrderStatus.Cancelling]: OrderStatus.PENDING,
}

export const emulatedTwapOrdersAtom = atom((get) => {
  const { account, chainId } = get(walletInfoAtom)
  const orders = get(twapOrdersListAtom)
  const accountLowerCase = account?.toLowerCase()

  if (!accountLowerCase) return []

  const orderWithComposableCowInfo: OrderWithComposableCowInfo[] = orders
    .filter((order) => order.chainId === chainId && order.safeAddress.toLowerCase() === accountLowerCase)
    .map((order) => {
      return {
        order: emulateTwapAsOrder(order),
        composableCowInfo: {
          id: order.id,
          status: statusesMap[order.status],
        },
      }
    })

  return orderWithComposableCowInfo
})
