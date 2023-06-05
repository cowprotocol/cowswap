import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { OrderParameters } from '@cowprotocol/cow-sdk'

export interface TwapDiscreteOrderItem {
  uid: string
  twapOrderId: string
  order: OrderParameters
  signature: string
}
export type TwapDiscreteOrders = { [twapOrderHash: string]: TwapDiscreteOrderItem }

export const twapDiscreteOrdersAtom = atomWithStorage<TwapDiscreteOrders>('twap-discrete-orders-list:v1', {})

export const twapDiscreteOrdersListAtom = atom((get) => Object.values(get(twapDiscreteOrdersAtom)))
