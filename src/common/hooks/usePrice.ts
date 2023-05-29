import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'
import { buildPriceFromCurrencyAmounts } from 'modules/limitOrders/utils/buildPriceFromCurrencyAmounts'
import { Nullish } from 'types'

export function usePrice(
  inputCurrencyAmount: Nullish<CurrencyAmount<Currency>>,
  outputCurrencyAmount: Nullish<CurrencyAmount<Currency>>
): Price<Currency, Currency> | null {
  return useSafeMemo(() => {
    return buildPriceFromCurrencyAmounts(inputCurrencyAmount, outputCurrencyAmount)
  }, [inputCurrencyAmount, outputCurrencyAmount])
}
