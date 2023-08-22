import { useSetAtom } from 'jotai'

import { useFiatValuePriceImpact } from 'legacy/hooks/usePriceImpact'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { useTradePriceImpactParams } from '../hooks/useTradePriceImpactParams'
import { priceImpactAtom } from '../state/priceImpactAtom'

export function PriceImpactUpdater() {
  const updatePriceImpact = useSetAtom(priceImpactAtom)
  const params = useTradePriceImpactParams()
  const { isLoading, priceImpact } = useFiatValuePriceImpact(params)

  useSafeEffect(() => {
    updatePriceImpact({ error: undefined, loading: isLoading, priceImpact })
  }, [isLoading, updatePriceImpact, priceImpact])

  return null
}
