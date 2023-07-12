import { atom } from 'jotai'

import { OrderClass, OrderStatus, SigningScheme } from '@cowprotocol/cow-sdk'

import { OrderStatus as OrderStatusInApp } from 'legacy/state/orders/actions'

import { OrderWithComposableCowInfo } from 'common/types'

import { twapOrdersAtom } from './twapOrdersListAtom'
import { twapPartOrdersListAtom } from './twapPartOrdersAtom'

import { TWAP_CANCELLED_STATUSES } from '../const'
import { TwapOrderItem, TwapOrderStatus } from '../types'

export const emulatedPartOrdersAtom = atom<OrderWithComposableCowInfo[]>((get) => {
  const twapOrders = get(twapOrdersAtom)
  const twapParticleOrders = get(twapPartOrdersListAtom)

  return twapParticleOrders.map<OrderWithComposableCowInfo>((order) => {
    const parent = twapOrders[order.twapOrderId]

    const creationDate = new Date((order.order.validTo - parent.order.t) * 1000)

    return {
      order: {
        ...order.order,
        creationDate: creationDate.toISOString(),
        class: OrderClass.LIMIT,
        status: getOrderStatus(parent),
        owner: parent.safeAddress.toLowerCase(),
        uid: order.uid,
        signingScheme: SigningScheme.EIP1271,
        signature: '',
        appData: parent.order.appData,
        totalFee: '0',
        feeAmount: '0',
        executedSellAmount: '0',
        executedSellAmountBeforeFees: '0',
        executedBuyAmount: '0',
        executedFeeAmount: '0',
        invalidated: TWAP_CANCELLED_STATUSES.includes(parent.status),
      },
      composableCowInfo: {
        isVirtualPart: true,
        parentId: order.twapOrderId,
        status: getPartOrderStatus(parent),
      },
    }
  })
})

function getOrderStatus(parent: TwapOrderItem): OrderStatus {
  if (parent.status === TwapOrderStatus.Fulfilled) return OrderStatus.FULFILLED
  if (parent.status === TwapOrderStatus.Expired) return OrderStatus.EXPIRED
  if (parent.status === TwapOrderStatus.Cancelled) return OrderStatus.CANCELLED

  return OrderStatus.OPEN
}

function getPartOrderStatus(parent: TwapOrderItem): OrderStatusInApp {
  if (parent.status === TwapOrderStatus.Expired) return OrderStatusInApp.EXPIRED
  if (parent.status === TwapOrderStatus.Cancelled) return OrderStatusInApp.CANCELLED

  return OrderStatusInApp.SCHEDULED
}
