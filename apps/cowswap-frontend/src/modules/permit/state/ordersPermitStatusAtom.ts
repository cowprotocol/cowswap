import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

import { OrdersPermitStatus } from '../types'

export const ordersPermitStatusAtom = atomWithReset<OrdersPermitStatus>({})

export const updateOrdersPermitStatusAtom = atom(null, (get, set, update: OrdersPermitStatus) =>
  set(ordersPermitStatusAtom, { ...get(ordersPermitStatusAtom), ...update })
)
