import { TokenWithLogo } from '@cowprotocol/common-const'
import { CurrencyAmount, Token } from '@cowprotocol/common-entities'
import { BigNumber } from '@ethersproject/bignumber'

export type TokenUsdAmounts = Record<
  string,
  {
    token: TokenWithLogo
    balance: BigNumber
    usdAmount?: CurrencyAmount<Token>
    isLoading: boolean
  }
>
