import { useMemo } from 'react'

import { ONE_HUNDRED_PERCENT } from '@cowprotocol/common-const'
import { useDebounce } from '@cowprotocol/common-hooks'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import JSBI from 'jsbi'
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

    const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)

    return { priceImpact, isLoading }
  }, [isTradeSetUp, fiatValueInput, fiatValueOutput, isLoading])
}

function computeFiatValuePriceImpact(
  fiatValueInput: CurrencyAmount<Currency> | undefined | null,
  fiatValueOutput: CurrencyAmount<Currency> | undefined | null,
): Percent | undefined {
  if (!fiatValueOutput || !fiatValueInput) return undefined
  if (JSBI.equal(fiatValueInput.quotient, JSBI.BigInt(0))) return undefined

  const pct = ONE_HUNDRED_PERCENT.subtract(fiatValueOutput.divide(fiatValueInput))

  return new Percent(pct.numerator, pct.denominator)
}
