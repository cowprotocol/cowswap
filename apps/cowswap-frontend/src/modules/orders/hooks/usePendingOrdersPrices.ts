import { useAtomValue } from 'jotai'

import { PendingOrdersPrices, pendingOrdersPricesAtom } from '../state/pendingOrdersPricesAtom'

export function usePendingOrdersPrices(): PendingOrdersPrices {
  return useAtomValue(pendingOrdersPricesAtom)
}
