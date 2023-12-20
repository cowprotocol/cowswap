import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import * as styledEl from 'modules/swap/pure/EthFlow/WrappingPreview/styled'

interface WrapCardProps {
  currency: Currency
  balance?: CurrencyAmount<Currency>
  amountToWrap?: CurrencyAmount<Currency>
}

export function WrapCard(props: WrapCardProps) {
  const { balance, amountToWrap, currency } = props

  return (
    <styledEl.WrapCardWrapper>
      {/* logo */}
      <TokenLogo token={currency} size={42} />
      {/* amount to wrap/unwrap */}
      <styledEl.BalanceLabel>
        <strong>
          <TokenAmount amount={amountToWrap} defaultValue="-" tokenSymbol={currency} />
        </strong>
      </styledEl.BalanceLabel>
      {/* user balance */}
      <styledEl.BalanceLabel>
        Balance:&nbsp;
        <TokenAmount amount={balance} />
      </styledEl.BalanceLabel>
    </styledEl.WrapCardWrapper>
  )
}
