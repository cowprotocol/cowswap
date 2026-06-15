import { useEffect, useMemo, useState } from 'react'

import { ONE_HUNDRED_PERCENT } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { FractionUtils, getWrappedToken } from '@cowprotocol/common-utils'
import { Fraction, Percent } from '@cowprotocol/currency'

import ms from 'ms.macro'

import { useDerivedTradeState } from 'modules/trade'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { logPriceImpact } from './logger'

const TRADE_SET_UP_DEBOUNCE_TIME = ms`100ms`
const PRICE_IMPACT_LOADING_TIMEOUT = ms`15s`

export function useFiatValuePriceImpact(): { priceImpact: Percent | undefined; isLoading: boolean } | null {
  const state = useDerivedTradeState()
  const { inputCurrencyAmount, outputCurrencyAmount, inputCurrency, outputCurrency } = state || {}

  const inputToken = useMemo(() => (inputCurrency ? getWrappedToken(inputCurrency) : undefined), [inputCurrency])
  const outputToken = useMemo(() => (outputCurrency ? getWrappedToken(outputCurrency) : undefined), [outputCurrency])

  const isTradeSetUp = useDebounce(!!inputToken && !!outputToken, TRADE_SET_UP_DEBOUNCE_TIME)

  const {
    inputAmount: { value: fiatValueInput, isLoading: inputIsLoading },
    outputAmount: { value: fiatValueOutput, isLoading: outputIsLoading },
  } = useTradeUsdAmounts(inputCurrencyAmount, outputCurrencyAmount, inputToken, outputToken)

  const isLoading = inputIsLoading || outputIsLoading
  const [hasLoadingTimedOut, setHasLoadingTimedOut] = useState(false)

  useEffect(() => {
    if (!isTradeSetUp) {
      setHasLoadingTimedOut(false)
      return
    }

    const timeoutId = setTimeout(() => {
      setHasLoadingTimedOut(true)
      logPriceImpact.warn(`Price impact loading timed out after ${PRICE_IMPACT_LOADING_TIMEOUT / 1000}s`)
    }, PRICE_IMPACT_LOADING_TIMEOUT)

    return () => clearTimeout(timeoutId)
  }, [isTradeSetUp])

  return useSafeMemo(() => {
    // Don't calculate price impact if trade is not set up (both trade assets are not set)
    if (!isTradeSetUp) return null

    const priceImpact = computeFiatValuePriceImpact(
      fiatValueInput ? FractionUtils.fractionLikeToFraction(fiatValueInput) : null,
      fiatValueOutput ? FractionUtils.fractionLikeToFraction(fiatValueOutput) : null,
    )

    return { priceImpact, isLoading: isLoading && !hasLoadingTimedOut }
  }, [isTradeSetUp, fiatValueInput, fiatValueOutput, isLoading, hasLoadingTimedOut])
}

function computeFiatValuePriceImpact(
  fiatValueInput: Fraction | null,
  fiatValueOutput: Fraction | null,
): Percent | undefined {
  if (!fiatValueOutput || !fiatValueInput) return undefined
  const fiatValueInputNum = +fiatValueInput.toFixed(6)
  if (!fiatValueInputNum || fiatValueInputNum <= 0) return undefined

  const pct = ONE_HUNDRED_PERCENT.subtract(fiatValueOutput.divide(fiatValueInput))

  return new Percent(pct.numerator, pct.denominator)
}
