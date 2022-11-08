import { useEffect } from 'react'
import { useUpdateAtom } from 'jotai/utils'
import { updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useGetInitialPrice } from '@cow/modules/limitOrders/hooks/useGetInitialPrice'

// Fetch and update initial price for the selected token pair
export function MarketPriceUpdater() {
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const { price, isLoading } = useGetInitialPrice()

  useEffect(() => {
    updateLimitRateState({ isLoading, activeRate: price, isTypedValue: false })
  }, [price, isLoading, updateLimitRateState])

  return null
}
