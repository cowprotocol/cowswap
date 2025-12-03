import { useMemo } from 'react'

import { ONE_HUNDRED_PERCENT } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { FractionUtils, getWrappedToken } from '@cowprotocol/common-utils'
import { Fraction, Percent } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

const TRADE_SET_UP_DEBOUNCE_TIME = ms`100ms`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useFiatValuePriceImpact() {
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

  return useSafeMemo(() => {
    // Don't calculate price impact if trade is not set up (both trade assets are not set)
    if (!isTradeSetUp) return null

    const priceImpact = computeFiatValuePriceImpact(
      fiatValueInput ? FractionUtils.fractionLikeToFraction(fiatValueInput) : null,
      fiatValueOutput ? FractionUtils.fractionLikeToFraction(fiatValueOutput) : null,
    )

    return { priceImpact, isLoading }
  }, [isTradeSetUp, fiatValueInput, fiatValueOutput, isLoading])
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
