import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { FractionUtils, getWrappedToken } from '@cowprotocol/common-utils'
import { Fraction, Token } from '@uniswap/sdk-core'

import { updateLimitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useTradeQuote } from 'modules/tradeQuote'
import { useUsdPrice } from 'modules/usdAmount/hooks/useUsdPrice'
import { Nullish } from 'types'

export function QuoteObserverUpdater() {
  const { response } = useTradeQuote()
  const state = useDerivedTradeState()

  const updateLimitRateState = useSetAtom(updateLimitRateAtom)

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  const inputToken = inputCurrency && getWrappedToken(inputCurrency)
  const outputToken = outputCurrency && getWrappedToken(outputCurrency)

  const { price, isLoading } = useSpotPrice(inputToken, outputToken)

  useEffect(() => {
    updateLimitRateState({ marketRate: price, isLoadingMarketRate: isLoading })
  }, [price, isLoading])
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
    const inputFraction = FractionUtils.fractionLikeToFraction(inputUsdPrice.price)
    const outputFraction = FractionUtils.fractionLikeToFraction(outputUsdPrice.price)

    const price = inputFraction.divide(outputFraction)

    return { price, isLoading }
  }, [inputUsdPrice?.price, inputUsdPrice?.isLoading, outputUsdPrice?.price, outputUsdPrice?.isLoading])
}
