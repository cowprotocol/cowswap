import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { FractionUtils, getWrappedToken } from '@cowprotocol/common-utils'
import { CurrencyAmount, Fraction, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { updateLimitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useTradeQuote } from 'modules/tradeQuote'
import { useUsdPrice } from 'modules/usdAmount/hooks/useUsdPrice'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function QuoteObserverUpdater() {
  const state = useDerivedTradeState()

  const updateLimitRateState = useSetAtom(updateLimitRateAtom)

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  const inputToken = inputCurrency && getWrappedToken(inputCurrency)
  const outputToken = outputCurrency && getWrappedToken(outputCurrency)

  const { price, isLoading } = useSpotPrice(inputToken, outputToken)

  // Update market rate based on spot prices
  useSafeEffect(() => {
    updateLimitRateState({ marketRate: price, isLoadingMarketRate: isLoading })
  }, [price, isLoading, updateLimitRateState])

  const { quote } = useTradeQuote()
  const feeAmountRaw = quote?.quoteResults.quoteResponse.quote.feeAmount
  const feeAmount = inputCurrency && feeAmountRaw ? CurrencyAmount.fromRawAmount(inputCurrency, feeAmountRaw) : null

  // Update fee amount based on quote response
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
