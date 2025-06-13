import { useAtomValue } from 'jotai'

import { priceImpactAtom } from '../state/priceImpactAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useTradePriceImpact() {
  return useAtomValue(priceImpactAtom)
}
