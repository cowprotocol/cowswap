import { useAtomValue } from 'jotai'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { stablePriceImpactAtom } from '../state/priceImpactAtom'

export function useTradePriceImpact(): PriceImpact {
  return useAtomValue(stablePriceImpactAtom)
}
