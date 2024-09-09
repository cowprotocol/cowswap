import { useSetAtom } from 'jotai'

import { orderParamsStateAtom } from '../state/orderParamsStateAtom'

export function useSetOrderParams() {
  return useSetAtom(orderParamsStateAtom)
}
