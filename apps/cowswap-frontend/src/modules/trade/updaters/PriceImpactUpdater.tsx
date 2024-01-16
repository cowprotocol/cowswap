import { useSetAtom } from 'jotai'

import { useFiatValuePriceImpact } from 'legacy/hooks/usePriceImpact'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { priceImpactAtom } from '../state/priceImpactAtom'

export function PriceImpactUpdater() {
  const updatePriceImpact = useSetAtom(priceImpactAtom)
  const priceImpactState = useFiatValuePriceImpact()

  useSafeEffect(() => {
    if (!priceImpactState) {
      return
    }

    const { isLoading, priceImpact } = priceImpactState

    updatePriceImpact({ loading: isLoading, priceImpact })
  }, [updatePriceImpact, priceImpactState])

  return null
}
