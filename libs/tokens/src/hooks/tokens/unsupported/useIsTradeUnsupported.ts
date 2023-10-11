import { Currency } from '@uniswap/sdk-core'
import { useIsUnsupportedToken } from './useIsUnsupportedToken'

export function useIsTradeUnsupported(
  inputCurrency: Currency | null | undefined,
  outputCurrency: Currency | null | undefined
): boolean {
  const isUnsupportedToken = useIsUnsupportedToken()
  const isInputCurrencyUnsupported = inputCurrency?.isNative ? false : !!isUnsupportedToken(inputCurrency?.address)
  const isOutputCurrencyUnsupported = outputCurrency?.isNative ? false : !!isUnsupportedToken(outputCurrency?.address)

  return isInputCurrencyUnsupported || isOutputCurrencyUnsupported
}
