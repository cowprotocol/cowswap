import { atom } from 'jotai'
import { Order } from 'state/orders/actions'

export const ordersToCancelAtom = atom<Order[]>([])
