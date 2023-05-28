import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { buildPriceFromCurrencyAmounts } from 'modules/limitOrders/utils/buildPriceFromCurrencyAmounts'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

export function usePrice(
  inputCurrencyAmount: CurrencyAmount<Currency> | null,
  outputCurrencyAmount: CurrencyAmount<Currency> | null
): Price<Currency, Currency> | null {
  return useSafeMemo(() => {
    return buildPriceFromCurrencyAmounts(inputCurrencyAmount, outputCurrencyAmount)
  }, [inputCurrencyAmount, outputCurrencyAmount])
}
