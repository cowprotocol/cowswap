import { useAtomValue } from 'jotai/index'

import { orderParamsStateAtom } from '../state/orderParamsStateAtom'

export function useOrderParams() {
  return useAtomValue(orderParamsStateAtom)
}
