import { useSetAtom } from 'jotai'

import { orderParamsStateAtom } from '../state/orderParamsStateAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSetOrderParams() {
  return useSetAtom(orderParamsStateAtom)
}
