import { useAtomValue, useSetAtom } from 'jotai/index'

import {
  PendingOrdersPermitValidityState,
  pendingOrdersPermitValidityStateAtom,
  updatePendingOrdersPermitValidityStateAtom,
} from './pendingOrdersPermitValidity.atom'

export function useGetPendingOrdersPermitValidityState(): PendingOrdersPermitValidityState {
  return useAtomValue(pendingOrdersPermitValidityStateAtom)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdatePendingOrdersPermitValidityState() {
  return useSetAtom(updatePendingOrdersPermitValidityStateAtom)
}
