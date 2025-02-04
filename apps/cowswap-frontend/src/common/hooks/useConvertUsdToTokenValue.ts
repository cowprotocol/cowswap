import { USDC } from '@cowprotocol/common-const'
import { getWrappedToken, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@uniswap/sdk-core'

import { useUsdPrice } from 'modules/usdAmount'

export function useConvertUsdToTokenValue(
  currency: Currency | null,
): (typedValue: string, isUsdMode: boolean) => string {
  const currencyUsdcPrice = useUsdPrice(currency ? getWrappedToken(currency) : null)

  return (typedValue: string, isUsdMode: boolean) => {
    if (isUsdMode && currencyUsdcPrice?.price) {
      const usdcToken = USDC[currencyUsdcPrice.currency.chainId as SupportedChainId]
      const usdAmount = tryParseCurrencyAmount(typedValue, usdcToken)

      const tokenAmount = currencyUsdcPrice.price.invert().quote(usdAmount)

      return tokenAmount.toExact()
    }

    return typedValue
  }
}
