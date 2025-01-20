import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { Fraction, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { updateLimitRateAtom } from 'modules/limitOrders/state/limitRateAtom'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useUsdPrice } from 'modules/usdAmount/hooks/useUsdPrice'

export function QuoteObserverUpdater() {
  const state = useDerivedTradeState()

  const updateLimitRateState = useSetAtom(updateLimitRateAtom)

  const inputCurrency = state?.inputCurrency
  const outputCurrency = state?.outputCurrency

  const inputToken = inputCurrency && getWrappedToken(inputCurrency)
  const outputToken = outputCurrency && getWrappedToken(outputCurrency)

  const { price, isLoading } = useSpotPrice(inputToken, outputToken)

  useEffect(() => {
    updateLimitRateState({ marketRate: price, isLoadingMarketRate: isLoading })
  }, [price, isLoading, updateLimitRateState])

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

    const price = inputUsdPrice.price.asFraction.divide(outputUsdPrice.price.asFraction)

    return { price, isLoading }
  }, [inputUsdPrice?.price, inputUsdPrice?.isLoading, outputUsdPrice?.price, outputUsdPrice?.isLoading])
}
