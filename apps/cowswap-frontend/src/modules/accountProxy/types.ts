import { TokenWithLogo } from '@cowprotocol/common-const'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

export type TokenUsdAmounts = Record<
  string,
  {
    token: TokenWithLogo
    balance: bigint
    usdAmount?: CurrencyAmount<Token>
    isLoading: boolean
  }
>
