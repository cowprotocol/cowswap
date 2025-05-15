import { TokenWithLogo } from '@cowprotocol/common-const'
import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { useUsdAmount } from 'modules/usdAmount'
import { UsdAmountInfo } from 'modules/usdAmount/hooks/useUsdAmount'

/**
 * Custom hook to parse amount string and get USD value
 */
export function useParsedAmountWithUsd(
  amountString?: string,
  token?: TokenWithLogo,
): { currencyAmount?: CurrencyAmount<Token>; usdInfo: UsdAmountInfo } {
  const currencyAmount = amountString && token ? tryParseCurrencyAmount(amountString, token) : undefined
  const usdInfo = useUsdAmount(currencyAmount, token)
  return { currencyAmount, usdInfo }
}
