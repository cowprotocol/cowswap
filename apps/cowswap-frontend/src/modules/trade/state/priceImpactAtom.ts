import { atom } from 'jotai'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

export const priceImpactAtom = atom<PriceImpact>({
  priceImpact: undefined,
  // Consider is loading by default to avoid flickering
  // PriceImpactUpdater will set it to false anyway
  loading: true,
})

// Add a derived atom to prevent showing unknown price impact during initial loading
export const stablePriceImpactAtom = atom<PriceImpact>((get) => {
  const priceImpact = get(priceImpactAtom)

  // If we're still loading and don't have a price impact yet, keep loading state
  // This prevents the "unknown price impact" warning from showing prematurely
  if (priceImpact.loading && priceImpact.priceImpact === undefined) {
    return { ...priceImpact, loading: true }
  }

  return priceImpact
})
