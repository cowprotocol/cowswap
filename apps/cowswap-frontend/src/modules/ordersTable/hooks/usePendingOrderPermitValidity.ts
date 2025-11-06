import { useAtomValue, useSetAtom } from 'jotai/index'

import {
  ActiveOrdersPermitValidityState,
  activeOrdersPermitValidityStateAtom,
  updateActiveOrdersPermitValidityStateAtom,
} from '../state/pendingOrdersPermitValidityState'

export function useGetActiveOrdersPermitValidityState(): ActiveOrdersPermitValidityState {
  return useAtomValue(activeOrdersPermitValidityStateAtom)
}

export function useUpdateActiveOrdersPermitValidityState(): ReturnType<
  typeof useSetAtom<typeof updateActiveOrdersPermitValidityStateAtom>
> {
  return useSetAtom(updateActiveOrdersPermitValidityStateAtom)
}
