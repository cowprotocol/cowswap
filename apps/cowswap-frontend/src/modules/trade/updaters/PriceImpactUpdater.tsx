import { useSetAtom } from 'jotai'

import { useFiatValuePriceImpact } from 'legacy/hooks/usePriceImpact'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { priceImpactAtom } from '../state/priceImpactAtom'

export function PriceImpactUpdater() {
  const updatePriceImpact = useSetAtom(priceImpactAtom)
  const { isLoading, priceImpact } = useFiatValuePriceImpact()

  useSafeEffect(() => {
    updatePriceImpact({ loading: isLoading, priceImpact })
  }, [isLoading, updatePriceImpact, priceImpact])

  return null
}
