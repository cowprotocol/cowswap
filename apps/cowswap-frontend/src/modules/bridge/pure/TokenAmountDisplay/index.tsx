import { ReactElement, ReactNode } from 'react'

import { Currency, CurrencyAmount, Token } from '@cowprotocol/currency'
import { TokenLogo } from '@cowprotocol/tokens'
import { FiatAmount, TokenAmount as LibTokenAmount, TokenAmountProps as LibTokenAmountProps } from '@cowprotocol/ui'

import { StatusColor, AmountWithTokenIcon } from './styled'

export interface TokenAmountDisplayProps {
  currencyAmount: CurrencyAmount<Currency> | null
  displaySymbol?: boolean
  usdValue?: CurrencyAmount<Token> | null
  status?: StatusColor
  libTokenAmountProps?: Omit<LibTokenAmountProps, 'amount' | 'tokenSymbol' | 'hideTokenSymbol'>
  hideTokenIcon?: boolean
  children?: ReactNode
}

export function TokenAmountDisplay({
  currencyAmount,
  displaySymbol,
  usdValue,
  status,
  libTokenAmountProps,
  children,
  hideTokenIcon = false,
}: TokenAmountDisplayProps): ReactElement | null {
  if (!currencyAmount) {
    return null
  }

  const token = currencyAmount.currency

  return (
    <AmountWithTokenIcon colorVariant={status}>
      {children}
      {!hideTokenIcon && <TokenLogo token={token} size={18} />}
      <LibTokenAmount
        amount={currencyAmount}
        tokenSymbol={displaySymbol ? token : undefined}
        hideTokenSymbol={false}
        {...libTokenAmountProps}
      />
      {usdValue && <FiatAmount amount={usdValue} withParentheses />}
    </AmountWithTokenIcon>
  )
}
