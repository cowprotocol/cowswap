import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import JSBI from 'jsbi'
import ms from 'ms.macro'

import { ONE_HUNDRED_PERCENT } from 'legacy/constants/misc'
import useDebounce from 'legacy/hooks/useDebounce'

import { useTradeFiatAmounts } from 'modules/fiatAmount'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { isFractionFalsy } from 'utils/isFractionFalsy'

import { ParsedAmounts } from './types'

const FIAT_VALUE_LOADING_THRESHOLD = ms`5s`

export function useFiatValuePriceImpact({ INPUT: inputAmount, OUTPUT: outputAmount }: ParsedAmounts) {
  const areBothValuesPresent = !isFractionFalsy(inputAmount) && !isFractionFalsy(outputAmount)
  const tradeAmounts = useSafeMemo(() => ({ inputAmount, outputAmount }), [inputAmount, outputAmount])
  const {
    inputAmount: { value: fiatValueInput, isLoading: inputIsLoading },
    outputAmount: { value: fiatValueOutput, isLoading: outputIsLoading },
  } = useTradeFiatAmounts(tradeAmounts)

  const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)

  // Consider the price impact loading if either the input or output amount is falsy
  // Debounce the loading state to prevent the price impact from flashing
  const isLoading = useDebounce(
    areBothValuesPresent ? inputIsLoading || outputIsLoading : true,
    FIAT_VALUE_LOADING_THRESHOLD
  )

  return useSafeMemo(() => ({ priceImpact, isLoading }), [priceImpact, isLoading])
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
