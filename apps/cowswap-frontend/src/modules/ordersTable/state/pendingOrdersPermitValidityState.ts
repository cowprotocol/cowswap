import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

import { Order } from 'legacy/state/orders/actions'

export type ActiveOrdersPermitValidityState = Record<Order['id'], boolean | undefined>

const initialState: ActiveOrdersPermitValidityState = {}

export const { atom: activeOrdersPermitValidityStateAtom, updateAtom: updateActiveOrdersPermitValidityStateAtom } =
  atomWithPartialUpdate(atom(initialState))
