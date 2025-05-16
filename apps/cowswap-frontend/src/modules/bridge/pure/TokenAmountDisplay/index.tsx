import { ReactElement, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { FiatAmount, TokenAmount as LibTokenAmount, TokenAmountProps as LibTokenAmountProps } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { StatusColor } from 'modules/bridge/utils/status'

import { AmountWithTokenIcon } from './styled'

export interface TokenAmountDisplayProps {
  token: TokenWithLogo
  amount?: string
  displaySymbol?: string
  usdValue?: CurrencyAmount<Token> | null
  hideFiatAmount?: boolean
  tokenLogoSize: number
  status?: StatusColor
  libTokenAmountProps?: Omit<LibTokenAmountProps, 'amount' | 'tokenSymbol' | 'hideTokenSymbol'>
  hideTokenIcon?: boolean
  // Allow pre-parsed amount to be passed to skip parsing step
  parsedAmount?: CurrencyAmount<Token> | null
}

export function TokenAmountDisplay({
  token,
  amount,
  displaySymbol,
  usdValue,
  hideFiatAmount = false,
  tokenLogoSize,
  status,
  libTokenAmountProps,
  hideTokenIcon = false,
  parsedAmount: providedParsedAmount,
}: TokenAmountDisplayProps): ReactElement | null {
  // Only parse the amount if not already provided and only when inputs change
  const parsedAmount = useMemo(() => {
    if (providedParsedAmount !== undefined) return providedParsedAmount
    return amount && token ? tryParseCurrencyAmount(amount, token) : null
  }, [amount, token, providedParsedAmount])

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
    <AmountWithTokenIcon colorVariant={status}>
      {!hideTokenIcon && <TokenLogo token={token} size={tokenLogoSize} />}
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
