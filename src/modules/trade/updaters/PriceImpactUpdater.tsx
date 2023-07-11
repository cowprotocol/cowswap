import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { usePriceImpact } from 'legacy/hooks/usePriceImpact'

import { useTradePriceImpactParams } from '../hooks/useTradePriceImpactParams'
import { priceImpactAtom } from '../state/priceImpactAtom'

export function PriceImpactUpdater() {
  const updatePriceImpact = useUpdateAtom(priceImpactAtom)
  const params = useTradePriceImpactParams()
  const priceImpact = usePriceImpact(params)
  const priceImpactValue = priceImpact.priceImpact?.quotient.toString()

  useEffect(() => {
    updatePriceImpact(priceImpact)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceImpactValue, priceImpact.loading, priceImpact.error, updatePriceImpact])

  return null
}
