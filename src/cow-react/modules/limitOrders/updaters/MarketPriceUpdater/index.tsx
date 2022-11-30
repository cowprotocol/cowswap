import { useEffect, useState } from 'react'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useGetInitialPrice } from '@cow/modules/limitOrders/hooks/useGetInitialPrice'
import { useLimitOrdersTradeState } from '../../hooks/useLimitOrdersTradeState'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'

// Fetch and update initial price for the selected token pair
export function MarketPriceUpdater() {
  const { inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersTradeState()
  const { executionRate } = useAtomValue(limitRateAtom)
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

  const [isInitialPriceSet, setIsInitialPriceSet] = useState(false)
  const { price, isLoading } = useGetInitialPrice()

  const isFalsey = (value: CurrencyAmount<Currency> | null) => !value || value.equalTo(0)

  useEffect(() => {
    updateLimitRateState({ initialRate: price, isTypedValue: false })
  }, [price, isLoading, updateLimitRateState])

  useEffect(() => {
    // Remove current execution rate on empty fields or zero value
    if (isFalsey(inputCurrencyAmount) || isFalsey(outputCurrencyAmount)) {
      updateLimitRateState({ executionRate: null })
    }
  }, [inputCurrencyAmount, outputCurrencyAmount, executionRate, updateLimitRateState])

  // Set initial price once on start
  useEffect(() => {
    if (!price || isInitialPriceSet || isLoading) return

    setIsInitialPriceSet(true)
    updateLimitRateState({ isLoading, activeRate: price, isTypedValue: false })
  }, [isInitialPriceSet, updateLimitRateState, price, isLoading])

  return null
}
