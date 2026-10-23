import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { FractionUtils, getWrappedToken } from '@cowprotocol/common-utils'
import { CurrencyAmount, Fraction, Token } from '@cowprotocol/currency'

import { Nullish } from 'types'

import { getPercentageRate, useDerivedTradeState } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useUsdPrice } from 'modules/usdAmount'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { useUpdateActiveRate } from '../../hooks/useUpdateActiveRate'
import { limitRateAtom, updateLimitRateAtom } from '../../state/limitRateAtom'

export function QuoteObserverUpdater(): null {
  const state = useDerivedTradeState()
  const { percentageSelection, activeRate } = useAtomValue(limitRateAtom)
  const updateRate = useUpdateActiveRate()

  const updateLimitRateState = useSetAtom(updateLimitRateAtom)

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  const inputToken = inputCurrency && getWrappedToken(inputCurrency)
  const outputToken = outputCurrency && getWrappedToken(outputCurrency)

  const { price, isLoading } = useSpotPrice(inputToken, outputToken)

  useSafeEffect(() => {
    updateLimitRateState({ marketRate: price, isLoadingMarketRate: isLoading })
  }, [price, isLoading, updateLimitRateState])

  useSafeEffect(() => {
    if (!percentageSelection || isLoading || !state?.inputCurrencyAmount) return
    const rate = getPercentageRate(price, percentageSelection.value, percentageSelection.isInverted)
    if (!rate || activeRate?.equalTo(rate)) return
    updateRate({
      activeRate: rate,
      percentageSelection,
      isTypedValue: false,
      isRateFromUrl: false,
      isAlternativeOrderRate: false,
    })
  }, [price, isLoading, percentageSelection, activeRate, state?.inputCurrencyAmount, updateRate])

  const { quote } = useTradeQuote()
  const feeAmountRaw = quote?.quoteResults.quoteResponse.quote.feeAmount
  const feeAmount = inputCurrency && feeAmountRaw ? CurrencyAmount.fromRawAmount(inputCurrency, feeAmountRaw) : null

  useSafeEffect(() => {
    updateLimitRateState({ feeAmount })
  }, [feeAmount, updateLimitRateState])

  return null
}

function useSpotPrice(
  inputCurrency: Nullish<Token>,
  outputCurrency: Nullish<Token>,
): {
  price: Fraction | null
  isLoading: boolean
} {
  const inputUsdPrice = useUsdPrice(inputCurrency)
  const outputUsdPrice = useUsdPrice(outputCurrency)

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  return useMemo(() => {
    const isLoading = !!inputUsdPrice?.isLoading || !!outputUsdPrice?.isLoading

    if (!inputUsdPrice?.price || !outputUsdPrice?.price) {
      return { price: null, isLoading }
    }
    const inputFraction = FractionUtils.fromPrice(inputUsdPrice.price)
    const outputFraction = FractionUtils.fromPrice(outputUsdPrice.price)

    const price = inputFraction.divide(outputFraction)

    return { price, isLoading }
  }, [inputUsdPrice?.price, inputUsdPrice?.isLoading, outputUsdPrice?.price, outputUsdPrice?.isLoading])
}
