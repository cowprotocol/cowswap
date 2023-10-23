import { useAtomValue } from 'jotai'

import { ordersPermitStatusAtom } from '../state/ordersPermitStatusAtom'

export function useGetOrdersPermitStatus() {
  return useAtomValue(ordersPermitStatusAtom)
}
