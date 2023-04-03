import { useLayoutEffect, useState } from 'react'
import { useUpdateAtom } from 'jotai/utils'
import { LimitRateState, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useGetInitialPrice } from '@cow/modules/limitOrders/hooks/useGetInitialPrice'
import { useLimitOrdersTradeState } from '../../hooks/useLimitOrdersTradeState'
import usePrevious from 'hooks/usePrevious'
import { useUpdateActiveRate } from '@cow/modules/limitOrders/hooks/useUpdateActiveRate'
import { Writeable } from '@cow/types'

// Fetch and update initial price for the selected token pair
export function InitialPriceUpdater() {
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const updateRate = useUpdateActiveRate()

  const [isInitialPriceSet, setIsInitialPriceSet] = useState(false)
  const { price, isLoading } = useGetInitialPrice()
  const prevPrice = usePrevious(price)

  useLayoutEffect(() => {
    const update: Partial<Writeable<LimitRateState>> = {
      initialRate: price,
      // Don't change isLoading flag when price is already set
      isLoading: isInitialPriceSet ? false : isLoading,
    }

    if (!isInitialPriceSet) {
      update.isTypedValue = false
    }

    updateLimitRateState(update)
  }, [isInitialPriceSet, price, isLoading, updateLimitRateState])

  // Set initial price once
  useLayoutEffect(() => {
    if (!price || isInitialPriceSet || isLoading || prevPrice?.equalTo(price)) return

    setIsInitialPriceSet(true)
    updateRate({ activeRate: price, isTypedValue: false, isRateFromUrl: false })
    updateLimitRateState({ isLoading })
  }, [isInitialPriceSet, updateLimitRateState, updateRate, price, isLoading, prevPrice])

  // Reset initial price set flag when any token was changed
  useLayoutEffect(() => {
    setIsInitialPriceSet(false)
  }, [inputCurrency, outputCurrency])

  return null
}
