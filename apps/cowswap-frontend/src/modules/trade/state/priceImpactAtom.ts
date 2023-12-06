import { atom } from 'jotai'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

export const priceImpactAtom = atom<PriceImpact>({
  priceImpact: undefined,
  // Consider is loading by default to avoid flickering
  // PriceImpactUpdater will set it to false anyway
  loading: true,
})
