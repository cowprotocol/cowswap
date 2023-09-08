import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import JSBI from 'jsbi'
import ms from 'ms.macro'

import { ONE_HUNDRED_PERCENT } from 'legacy/constants/misc'
import useDebounce from 'legacy/hooks/useDebounce'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

const FIAT_VALUE_LOADING_THRESHOLD = ms`0.1s`

export function useFiatValuePriceImpact() {
  const { state } = useDerivedTradeState()
  const { inputCurrencyAmount, outputCurrencyAmount, inputCurrency, outputCurrency } = state || {}

  const isTradeSetUp = !!inputCurrency && !!outputCurrency

  const {
    inputAmount: { value: fiatValueInput, isLoading: inputIsLoading },
    outputAmount: { value: fiatValueOutput, isLoading: outputIsLoading },
  } = useTradeUsdAmounts(inputCurrencyAmount, outputCurrencyAmount)

  // Consider the price impact loading if either the input or output amount is falsy
  // Debounce the loading state to prevent the price impact from flashing
  const isLoading = useDebounce(isTradeSetUp ? inputIsLoading || outputIsLoading : false, FIAT_VALUE_LOADING_THRESHOLD)

  return useSafeMemo(() => {
    const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)

    return { priceImpact, isLoading }
  }, [fiatValueInput, fiatValueOutput, isLoading])
}

function computeFiatValuePriceImpact(
  fiatValueInput: CurrencyAmount<Currency> | undefined | null,
  fiatValueOutput: CurrencyAmount<Currency> | undefined | null
): Percent | undefined {
  if (!fiatValueOutput || !fiatValueInput) return undefined
  if (!fiatValueInput.currency.equals(fiatValueOutput.currency)) return undefined
  if (JSBI.equal(fiatValueInput.quotient, JSBI.BigInt(0))) return undefined

  const pct = ONE_HUNDRED_PERCENT.subtract(fiatValueOutput.divide(fiatValueInput))

  return new Percent(pct.numerator, pct.denominator)
}
