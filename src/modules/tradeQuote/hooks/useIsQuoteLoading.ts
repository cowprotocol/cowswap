import { useMemo } from 'react'
import { useAtomValue } from 'jotai/utils'
import { advancedOrdersDerivedStateAtom } from 'modules/advancedOrders'
import { tradeQuoteAtom } from '../state/tradeQuoteAtom'

export function useIsQuoteLoading() {
  const { inputCurrency, outputCurrency } = useAtomValue(advancedOrdersDerivedStateAtom)
  const { isLoading } = useAtomValue(tradeQuoteAtom)

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency) {
      return false
    }

    return !!isLoading
  }, [inputCurrency, outputCurrency, isLoading])
}
