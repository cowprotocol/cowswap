import { TokenWithLogo } from '@cowprotocol/common-const'
import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

export type TokenUsdAmounts = Record<
  string,
  {
    token: TokenWithLogo
    balance: BigNumber
    usdAmount?: CurrencyAmount<Token>
    isLoading: boolean
  }
>
