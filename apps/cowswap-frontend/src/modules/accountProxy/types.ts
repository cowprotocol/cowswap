import { TokenWithLogo } from '@cowprotocol/common-const'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

export type TokenUsdAmounts = Record<
  string,
  {
    token: TokenWithLogo
    balance: bigint
    usdAmount?: CurrencyAmount<Token>
    isLoading: boolean
  }
>
