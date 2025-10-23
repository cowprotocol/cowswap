import { useAtomValue, useSetAtom } from 'jotai/index'

import {
  PendingOrdersPermitValidityState,
  pendingOrdersPermitValidityStateAtom,
  updatePendingOrdersPermitValidityStateAtom,
} from '../state/pendingOrdersPermitValidityState'

export function useGetPendingOrdersPermitValidityState(): PendingOrdersPermitValidityState {
  return useAtomValue(pendingOrdersPermitValidityStateAtom)
}

export function useUpdatePendingOrdersPermitValidityState(): ReturnType<
  typeof useSetAtom<typeof updatePendingOrdersPermitValidityStateAtom>
> {
  return useSetAtom(updatePendingOrdersPermitValidityStateAtom)
}
