import { useEffect, useState } from 'react'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useGetInitialPrice } from '@cow/modules/limitOrders/hooks/useGetInitialPrice'
import { useLimitOrdersTradeState } from '../../hooks/useLimitOrdersTradeState'
import { isFractionFalsy } from '@cow/utils/isFractionFalsy'
import usePrevious from '@src/hooks/usePrevious'

// Fetch and update initial price for the selected token pair
export function MarketPriceUpdater() {
  const { inputCurrencyAmount, outputCurrencyAmount, inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const { executionRate } = useAtomValue(limitRateAtom)
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

  const [isInitialPriceSet, setIsInitialPriceSet] = useState(false)
  const { price, isLoading } = useGetInitialPrice()
  const prevPrice = usePrevious(price)

  useEffect(() => {
    updateLimitRateState({
      // Don't change isLoading flag when price is already set
      isLoading: isInitialPriceSet ? false : isLoading,
      initialRate: price,
      isTypedValue: false,
    })
  }, [isInitialPriceSet, price, isLoading, updateLimitRateState])

  useEffect(() => {
    // Remove current execution rate on empty fields or zero value
    if (isFractionFalsy(inputCurrencyAmount) || isFractionFalsy(outputCurrencyAmount)) {
      updateLimitRateState({ executionRate: null })
    }
  }, [inputCurrencyAmount, outputCurrencyAmount, executionRate, updateLimitRateState])

  // Set initial price once
  useEffect(() => {
    if (!price || isInitialPriceSet || isLoading || prevPrice?.equalTo(price)) return

    setIsInitialPriceSet(true)
    updateLimitRateState({ isLoading, activeRate: price, isTypedValue: false })
  }, [isInitialPriceSet, updateLimitRateState, price, isLoading, prevPrice])

  // Reset initial price set flag when any token was changed
  useEffect(() => {
    setIsInitialPriceSet(false)
  }, [inputCurrency, outputCurrency])

  return null
}
