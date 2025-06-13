import { useSetAtom } from 'jotai'

import { useFiatValuePriceImpact } from 'legacy/hooks/usePriceImpact'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { priceImpactAtom } from '../state/priceImpactAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
