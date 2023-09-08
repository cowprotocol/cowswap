import { atom } from 'jotai'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

export const priceImpactAtom = atom<PriceImpact>({
  priceImpact: undefined,
  loading: false,
})
