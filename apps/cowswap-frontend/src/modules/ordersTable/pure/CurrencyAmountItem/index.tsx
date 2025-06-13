import { Media, TokenAmount, UI } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

const AmountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  ${Media.upToSmall()} {
    white-space: normal;
  }

  > div {
    display: flex;
    align-items: center;
  }

  > span {
    white-space: normal;
    word-break: break-all;
    max-width: 150px;
    display: inline;
  }

  > span > span {
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CurrencyAmountItem({ amount }: { amount: CurrencyAmount<Currency> }) {
  return (
    <AmountItem title={amount.toExact() + ' ' + amount.currency.symbol}>
      <TokenAmount amount={amount} tokenSymbol={amount.currency} />
    </AmountItem>
  )
}
