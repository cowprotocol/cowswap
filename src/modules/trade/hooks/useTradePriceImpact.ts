import { useAtomValue } from 'jotai/utils'

import { priceImpactAtom } from '../state/priceImpactAtom'

export function useTradePriceImpact() {
  return useAtomValue(priceImpactAtom)
}
