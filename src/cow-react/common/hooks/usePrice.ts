import { useSafeMemo } from '@cow/common/hooks/useSafeMemo'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'
import { buildPriceFromCurrencyAmounts } from '@cow/modules/limitOrders/utils/buildPriceFromCurrencyAmounts'

export function usePrice(
  inputCurrencyAmount: CurrencyAmount<Currency> | null,
  outputCurrencyAmount: CurrencyAmount<Currency> | null
): Price<Currency, Currency> | null {
  return useSafeMemo(() => {
    return buildPriceFromCurrencyAmounts(inputCurrencyAmount, outputCurrencyAmount)
  }, [inputCurrencyAmount, outputCurrencyAmount])
}
