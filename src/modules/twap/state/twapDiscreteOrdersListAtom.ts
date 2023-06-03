import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { OrderParameters } from '@cowprotocol/cow-sdk'

export type TwapDiscreteOrderItem = { order: OrderParameters; signature: string }
export type TwapDiscreteOrdersList = { [twapOrderHash: string]: TwapDiscreteOrderItem }

export const twapDiscreteOrdersListAtom = atomWithStorage<TwapDiscreteOrdersList>('twap-discrete-orders-list:v1', {})

export const updateTwapDiscreteOrdersListAtom = atom(null, (get, set, nextState: TwapDiscreteOrdersList) => {
  set(twapDiscreteOrdersListAtom, () => {
    const prevState = get(twapDiscreteOrdersListAtom)

    return { ...prevState, ...nextState }
  })
})
