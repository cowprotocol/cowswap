import { useEffect } from 'react'
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

  const { price, isLoading } = useGetInitialPrice()

  const isFalsey = (value: CurrencyAmount<Currency> | null) => !value || value.equalTo(0)

  useEffect(() => {
    // Don't update activeRate while loading
    if (isLoading) {
      updateLimitRateState({ isLoading })
    } else {
      updateLimitRateState({ isLoading, activeRate: price, isTypedValue: false })
    }
  }, [price, isLoading, updateLimitRateState])

  useEffect(() => {
    // Remove current execution rate on empty fields or zero value
    if (isFalsey(inputCurrencyAmount) || isFalsey(outputCurrencyAmount)) {
      updateLimitRateState({ executionRate: null })
    }
  }, [inputCurrencyAmount, outputCurrencyAmount, executionRate, updateLimitRateState])

  return null
}
