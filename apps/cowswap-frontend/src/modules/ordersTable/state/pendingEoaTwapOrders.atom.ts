import { atom } from 'jotai'

import { OrderStatus } from 'legacy/state/orders/actions'

import { emulatedTwapOrdersAtom } from 'modules/twap/state/emulatedTwapOrdersAtom'

/** Pending EOA TWAP parent orders for partial-approval affected-order warnings. */
export const pendingEoaTwapOrdersAtom = atom((get) => {
  return get(emulatedTwapOrdersAtom).filter(
    (order) => order.status === OrderStatus.PENDING && order.isEoaTwapOrder === true,
  )
})
