import { useMemo } from 'react'
import { useAtomValue } from 'jotai/utils'
import { advancedOrdersDerivedStateAtom } from 'modules/advancedOrders/state/advancedOrdersAtom'
import { advancedOrdersQuoteAtom } from 'modules/advancedOrders/state/advancedOrdersQuoteAtom'

export function useIsQuoteLoading() {
  const { inputCurrency, outputCurrency } = useAtomValue(advancedOrdersDerivedStateAtom)
  const { isLoading } = useAtomValue(advancedOrdersQuoteAtom)

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency) {
      return false
    }

    return !!isLoading
  }, [inputCurrency, outputCurrency, isLoading])
}
