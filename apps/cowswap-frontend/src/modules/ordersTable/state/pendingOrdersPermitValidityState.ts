import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

import { Order } from 'legacy/state/orders/actions'

export type PendingOrdersPermitValidityState = Record<Order['id'], boolean | undefined>

const initialState: PendingOrdersPermitValidityState = {}

export const { atom: pendingOrdersPermitValidityStateAtom, updateAtom: updatePendingOrdersPermitValidityStateAtom } =
  atomWithPartialUpdate(atom(initialState))
