import { ReactElement } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { FiatAmount, TokenAmount as LibTokenAmount, TokenAmountProps as LibTokenAmountProps } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { AmountWithTokenIcon } from './styled' // This path is correct for the new location

export interface TokenAmountDisplayProps {
  token: TokenWithLogo
  amount: string
  displaySymbol?: string
  usdValue?: CurrencyAmount<Token> | null
  hideFiatAmount?: boolean
  tokenLogoSize: number
  libTokenAmountProps?: Omit<LibTokenAmountProps, 'amount' | 'tokenSymbol' | 'hideTokenSymbol'>
}

export function TokenAmountDisplay({
  token,
  amount,
  displaySymbol,
  usdValue,
  hideFiatAmount = false,
  tokenLogoSize,
  libTokenAmountProps,
}: TokenAmountDisplayProps): ReactElement | null {
  const parsedAmount = tryParseCurrencyAmount(amount, token)

  if (!parsedAmount) {
    // Or, to be safe and explicit, return null if parsing fails,
    // as LibTokenAmount might expect a non-null amount if we pass it.
    // However, LibTokenAmountProps amount is Nullish<FractionLike>.
    // So, passing a null parsedAmount should be fine.
    return null
  }

  const tokenSymbolForLib: LibTokenAmountProps['tokenSymbol'] = {
    symbol: displaySymbol || token.symbol || 'Unknown',
  }

  return (
    <AmountWithTokenIcon>
      <TokenLogo token={token} size={tokenLogoSize} />
      <LibTokenAmount
        amount={parsedAmount}
        tokenSymbol={tokenSymbolForLib}
        hideTokenSymbol={false}
        {...libTokenAmountProps}
      />
      {!hideFiatAmount && usdValue && (
        <i>
          (<FiatAmount amount={usdValue} />)
        </i>
      )}
    </AmountWithTokenIcon>
  )
}
