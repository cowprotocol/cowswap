import { useSetAtom } from 'jotai'

import { usePriceImpact } from 'legacy/hooks/usePriceImpact'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { useTradePriceImpactParams } from '../hooks/useTradePriceImpactParams'
import { priceImpactAtom } from '../state/priceImpactAtom'

export function PriceImpactUpdater() {
  const updatePriceImpact = useSetAtom(priceImpactAtom)
  const params = useTradePriceImpactParams()
  const { error, loading, priceImpact } = usePriceImpact(params)

  useSafeEffect(() => {
    updatePriceImpact({ error, loading, priceImpact })
  }, [error, loading, updatePriceImpact, priceImpact])

  return null
}
