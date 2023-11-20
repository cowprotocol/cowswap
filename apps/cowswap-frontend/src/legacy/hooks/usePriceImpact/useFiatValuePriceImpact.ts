import { useEffect, useState } from 'react'

import { ONE_HUNDRED_PERCENT } from '@cowprotocol/common-const'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import JSBI from 'jsbi'
import ms from 'ms.macro'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

const TRADE_SETUP_DEBOUNCE = ms`3s`

export function useFiatValuePriceImpact() {
  const { state } = useDerivedTradeState()
  const { inputCurrencyAmount, outputCurrencyAmount, inputCurrency, outputCurrency } = state || {}

  const isTradeSetUp = !!inputCurrency && !!outputCurrency
  const tradeKey = (inputCurrency?.symbol || '') + (outputCurrency?.symbol || '')

  const {
    inputAmount: { value: fiatValueInput },
    outputAmount: { value: fiatValueOutput },
  } = useTradeUsdAmounts(inputCurrencyAmount, outputCurrencyAmount)

  const [isPriceImpactLoading, setIsPriceImpactLoading] = useState(false)

  // To avoid warning flickering, we wait 3 seconds since the trade is set up to show the loading state
  // `isPriceImpactLoading` value recalculates every time the trade assets change
  useEffect(() => {
    if (tradeKey) {
      setIsPriceImpactLoading(true)
    }

    const timeout = setTimeout(() => {
      setIsPriceImpactLoading(false)
    }, TRADE_SETUP_DEBOUNCE)

    return () => clearTimeout(timeout)
  }, [tradeKey])

  const isLoading = isTradeSetUp ? isPriceImpactLoading : false

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
