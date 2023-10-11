import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

import { OrdersPermitStatus } from '../types'

export const { atom: ordersPermitStatusAtom, updateAtom: updateOrdersPermitStatusAtom } = atomWithPartialUpdate(
  atom<OrdersPermitStatus>({})
)
