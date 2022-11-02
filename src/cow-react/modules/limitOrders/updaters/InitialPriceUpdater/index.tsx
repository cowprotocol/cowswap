import { useEffect } from 'react'
import { useUpdateAtom } from 'jotai/utils'
import { updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useGetInitialPrice } from '@cow/modules/limitOrders/hooks/useGetInitialPrice'

export function InitialPriceUpdater() {
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const { price, isLoading } = useGetInitialPrice()

  useEffect(() => {
    updateLimitRateState({ isLoading, activeRate: price ? price.toFixed(20) : '0' })
  }, [price, isLoading, updateLimitRateState])

  return null
}
