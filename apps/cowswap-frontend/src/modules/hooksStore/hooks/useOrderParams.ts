import { useAtomValue } from 'jotai'

import { orderParamsStateAtom } from '../state/orderParamsStateAtom'

export function useOrderParams() {
  return useAtomValue(orderParamsStateAtom)
}
