import { useLayoutEffect, useState } from 'react'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useGetInitialPrice } from '@cow/modules/limitOrders/hooks/useGetInitialPrice'
import { useLimitOrdersTradeState } from '../../hooks/useLimitOrdersTradeState'
import { isFractionFalsy } from '@cow/utils/isFractionFalsy'
import usePrevious from '@src/hooks/usePrevious'
import { useUpdateActiveRate } from '@cow/modules/limitOrders/hooks/useUpdateActiveRate'

// Fetch and update initial price for the selected token pair
export function MarketPriceUpdater() {
  const { inputCurrencyAmount, outputCurrencyAmount, inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const { executionRate } = useAtomValue(limitRateAtom)
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)
  const updateRate = useUpdateActiveRate()

  const [isInitialPriceSet, setIsInitialPriceSet] = useState(false)
  const { price, isLoading } = useGetInitialPrice()
  const prevPrice = usePrevious(price)

  useLayoutEffect(() => {
    updateLimitRateState({
      // Don't change isLoading flag when price is already set
      isLoading: isInitialPriceSet ? false : isLoading,
      initialRate: price,
      isTypedValue: false,
    })
  }, [isInitialPriceSet, price, isLoading, updateLimitRateState])

  useLayoutEffect(() => {
    // Remove current execution rate on empty fields or zero value
    if (isFractionFalsy(inputCurrencyAmount) || isFractionFalsy(outputCurrencyAmount)) {
      updateLimitRateState({ executionRate: null })
    }
  }, [inputCurrencyAmount, outputCurrencyAmount, executionRate, updateLimitRateState])

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
