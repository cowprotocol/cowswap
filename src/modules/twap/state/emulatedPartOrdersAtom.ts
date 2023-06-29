import { atom } from 'jotai'

import { OrderClass, OrderStatus, SigningScheme } from '@cowprotocol/cow-sdk'

import { OrderStatus as OrderStatusInApp } from 'legacy/state/orders/actions'

import { OrderWithComposableCowInfo } from 'common/types'

import { twapOrdersListAtom } from './twapOrdersListAtom'
import { twapPartOrdersListAtom } from './twapPartOrdersAtom'

export const emulatedPartOrdersAtom = atom<OrderWithComposableCowInfo[]>((get) => {
  const twapOrders = get(twapOrdersListAtom)
  const twapParticleOrders = get(twapPartOrdersListAtom)

  return twapParticleOrders.map<OrderWithComposableCowInfo>((order) => {
    const parent = twapOrders[order.twapOrderId]

    const creationDate = new Date((order.order.validTo - parent.order.t) * 1000)

    return {
      order: {
        ...order.order,
        creationDate: creationDate.toISOString(),
        class: OrderClass.LIMIT,
        status: OrderStatus.OPEN,
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
        invalidated: false,
      },
      composableCowInfo: {
        parentId: order.twapOrderId,
        status: OrderStatusInApp.SCHEDULED,
      },
    }
  })
})
