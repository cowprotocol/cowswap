import { useMemo } from 'react'
import { useAtomValue } from 'jotai/utils'
import { advancedOrdersFullStateAtom } from '@cow/modules/advancedOrders/state/advancedOrdersAtom'
import { advancedOrdersQuoteAtom } from '@cow/modules/advancedOrders/state/advancedOrdersQuoteAtom'

export function useIsQuoteLoading() {
  const { inputCurrency, outputCurrency } = useAtomValue(advancedOrdersFullStateAtom)
  const { isLoading } = useAtomValue(advancedOrdersQuoteAtom)

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency) {
      return false
    }

    return !!isLoading
  }, [inputCurrency, outputCurrency, isLoading])
}
