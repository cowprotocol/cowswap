import { ReactElement } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { FiatAmount, TokenAmount as LibTokenAmount, TokenAmountProps as LibTokenAmountProps } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { StatusColor } from 'modules/bridge/utils/status'

import { AmountWithTokenIcon } from './styled'

export interface TokenAmountDisplayProps {
  token: TokenWithLogo
  currencyAmount: CurrencyAmount<Token> | null
  displaySymbol?: string
  usdValue?: CurrencyAmount<Token> | null
  hideFiatAmount?: boolean
  tokenLogoSize: number
  status?: StatusColor
  libTokenAmountProps?: Omit<LibTokenAmountProps, 'amount' | 'tokenSymbol' | 'hideTokenSymbol'>
  hideTokenIcon?: boolean
}

export function TokenAmountDisplay({
  token,
  currencyAmount,
  displaySymbol,
  usdValue,
  hideFiatAmount = false,
  tokenLogoSize,
  status,
  libTokenAmountProps,
  hideTokenIcon = false,
}: TokenAmountDisplayProps): ReactElement | null {
  if (!currencyAmount) {
    return null
  }

  const tokenSymbolForLib: LibTokenAmountProps['tokenSymbol'] = {
    symbol: displaySymbol || token.symbol || 'Unknown',
  }

  return (
    <AmountWithTokenIcon colorVariant={status}>
      {!hideTokenIcon && <TokenLogo token={token} size={tokenLogoSize} />}
      <LibTokenAmount
        amount={currencyAmount}
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
