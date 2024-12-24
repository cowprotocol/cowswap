import { TokenWithLogo, USDC } from '@cowprotocol/common-const'
import { getWrappedToken, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useUsdPrice } from 'modules/usdAmount'

export function useConvertUsdToTokenValue(
  currency: Currency | null,
): (typedValue: string, isUsdMode: boolean) => string {
  const currencyUsdcPrice = useUsdPrice(currency ? getWrappedToken(currency) : null)

  return (typedValue: string, isUsdMode: boolean) => {
    if (isUsdMode && currencyUsdcPrice?.price) {
      const usdcToken = USDC[currencyUsdcPrice.currency.chainId as SupportedChainId]
      const usdAmount = tryParseCurrencyAmount(typedValue, usdcToken)

      const tokenAmount = currencyUsdcPrice.price.invert().quote(hackyAdjustAmountDust(usdAmount))

      return tokenAmount.toExact()
    }

    return typedValue
  }
}

/**
 * TODO: this is a hacky way to adjust the amount to avoid dust
 * For some reason, when you enter for example $366, price.quote() returns 365,9999999999
 */
function hackyAdjustAmountDust(amount: CurrencyAmount<TokenWithLogo>): typeof amount {
  return amount.add(tryParseCurrencyAmount('0.000001', amount.currency))
}
