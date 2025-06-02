import { ReactElement } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { FiatAmount, TokenAmount as LibTokenAmount, TokenAmountProps as LibTokenAmountProps } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { StatusColor, AmountWithTokenIcon } from './styled'

export interface TokenAmountDisplayProps {
  currencyAmount: CurrencyAmount<Currency> | null
  displaySymbol?: boolean
  usdValue?: CurrencyAmount<Token> | null
  status?: StatusColor
  libTokenAmountProps?: Omit<LibTokenAmountProps, 'amount' | 'tokenSymbol' | 'hideTokenSymbol'>
  hideTokenIcon?: boolean
}

export function TokenAmountDisplay({
  currencyAmount,
  displaySymbol,
  usdValue,
  status,
  libTokenAmountProps,
  hideTokenIcon = false,
}: TokenAmountDisplayProps): ReactElement | null {
  if (!currencyAmount) {
    return null
  }

  const token = currencyAmount.currency

  return (
    <AmountWithTokenIcon colorVariant={status}>
      {!hideTokenIcon && <TokenLogo token={token} size={18} />}
      <LibTokenAmount
        amount={currencyAmount}
        tokenSymbol={displaySymbol ? token : undefined}
        hideTokenSymbol={false}
        {...libTokenAmountProps}
      />
      {usdValue && (
        <i>
          (<FiatAmount amount={usdValue} />)
        </i>
      )}
    </AmountWithTokenIcon>
  )
}
