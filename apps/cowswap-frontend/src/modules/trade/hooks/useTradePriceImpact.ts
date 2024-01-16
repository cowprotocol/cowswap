import { useAtomValue } from 'jotai'

import { priceImpactAtom } from '../state/priceImpactAtom'

export function useTradePriceImpact() {
  return useAtomValue(priceImpactAtom)
}
