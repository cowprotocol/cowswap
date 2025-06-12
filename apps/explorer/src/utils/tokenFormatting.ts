import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { formatSmartMaxPrecision, isNativeToken, safeTokenName } from 'utils'

export interface FormattedTokenAmount {
  formattedAmount: string
  symbol: string
  isNative: boolean
}

export function formatTokenAmount(amount: BigNumber, token: TokenErc20): FormattedTokenAmount {
  const formattedAmount = token.decimals >= 0 ? formatSmartMaxPrecision(amount, token) : amount.toString(10)

  return {
    formattedAmount,
    symbol: safeTokenName(token),
    isNative: isNativeToken(token.address),
  }
}
