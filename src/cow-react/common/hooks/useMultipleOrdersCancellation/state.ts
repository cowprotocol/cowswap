import { atom } from 'jotai'
import { Order } from 'state/orders/actions'

// null - when orders cancellation is not enabled
// [] - when orders cancellation is enabled
export const ordersToCancelAtom = atom<Order[] | null>(null)
