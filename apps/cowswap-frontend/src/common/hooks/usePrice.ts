import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { buildPriceFromCurrencyAmounts } from 'modules/utils/orderUtils/buildPriceFromCurrencyAmounts'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

export function usePrice(
  inputCurrencyAmount: Nullish<CurrencyAmount<Currency>>,
  outputCurrencyAmount: Nullish<CurrencyAmount<Currency>>
): Price<Currency, Currency> | null {
  return useSafeMemo(() => {
    return buildPriceFromCurrencyAmounts(inputCurrencyAmount, outputCurrencyAmount)
  }, [inputCurrencyAmount, outputCurrencyAmount])
}
