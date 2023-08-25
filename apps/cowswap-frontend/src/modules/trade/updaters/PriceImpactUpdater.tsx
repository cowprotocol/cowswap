import { useSetAtom } from 'jotai'

import { useFiatValuePriceImpact } from 'legacy/hooks/usePriceImpact'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { useTradeParsedAmounts } from '../hooks/useTradeParsedAmounts'
import { priceImpactAtom } from '../state/priceImpactAtom'

export function PriceImpactUpdater() {
  const updatePriceImpact = useSetAtom(priceImpactAtom)
  const params = useTradeParsedAmounts()
  const { isLoading, priceImpact } = useFiatValuePriceImpact(params)

  useSafeEffect(() => {
    updatePriceImpact({ loading: isLoading, priceImpact })
  }, [isLoading, updatePriceImpact, priceImpact])

  return null
}
