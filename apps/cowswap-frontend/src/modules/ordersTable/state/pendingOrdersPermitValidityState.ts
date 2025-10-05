import { atom, useAtomValue, useSetAtom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

import { Order } from 'legacy/state/orders/actions'

type PendingOrdersPermitValidityState = Record<Order['id'], boolean | undefined>

const initialState: PendingOrdersPermitValidityState = {}

const { atom: pendingOrdersPermitValidityStateAtom, updateAtom: updatePendingOrdersPermitValidityStateAtom } =
  atomWithPartialUpdate(atom(initialState))

export function usePendingOrdersPermitValidityState(): {
  pendingOrdersPermitValidityState: PendingOrdersPermitValidityState
  updatePendingOrdersPermitValidityState: ReturnType<
    typeof useSetAtom<typeof updatePendingOrdersPermitValidityStateAtom>
  >
} {
  return {
    pendingOrdersPermitValidityState: useAtomValue(pendingOrdersPermitValidityStateAtom),
    updatePendingOrdersPermitValidityState: useSetAtom(updatePendingOrdersPermitValidityStateAtom),
  }
}
