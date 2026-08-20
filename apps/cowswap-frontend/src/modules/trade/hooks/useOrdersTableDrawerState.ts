import { useAtomValue } from 'jotai'

import { OrdersTableDrawerState, ordersTableDrawerAtom } from '../state/ordersTableDrawerAtom'

export function useOrdersTableDrawerState(): OrdersTableDrawerState {
  return useAtomValue(ordersTableDrawerAtom)
}
