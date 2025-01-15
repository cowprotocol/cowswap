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

  const spotPrice = useSpotPrice(inputToken, outputToken)

  useEffect(() => {
    updateLimitRateState({ marketRate: spotPrice })
  }, [spotPrice])
}

function useSpotPrice(inputCurrency: Nullish<Token>, outputCurrency: Nullish<Token>): Fraction | null {
  const inputUsdPrice = useUsdPrice(inputCurrency)
  const outputUsdPrice = useUsdPrice(outputCurrency)

  return useMemo(() => {
    if (!inputUsdPrice?.price || !outputUsdPrice?.price) {
      return null
    }
    const inputFraction = FractionUtils.fractionLikeToFraction(inputUsdPrice.price)
    const outputFraction = FractionUtils.fractionLikeToFraction(outputUsdPrice.price)

    return inputFraction.divide(outputFraction)
  }, [inputUsdPrice?.price, outputUsdPrice?.price])
}
