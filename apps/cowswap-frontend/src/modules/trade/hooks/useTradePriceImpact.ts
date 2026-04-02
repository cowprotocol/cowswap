import { useAtomValue } from 'jotai'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { priceImpactAtom } from '../state/priceImpactAtom'

export function useTradePriceImpact(): PriceImpact {
  return useAtomValue(priceImpactAtom)
}
