import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TokenLogo } from '@cowprotocol/tokens'
import { font, TokenAmount, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'
import { Nullish } from 'types'

export interface SolanaTradeAmountsRowProps {
  inputAmount: Nullish<CurrencyAmount<Currency>>
  outputAmount: Nullish<CurrencyAmount<Currency>>
}

export function SolanaTradeAmountsRow({ inputAmount, outputAmount }: SolanaTradeAmountsRowProps): ReactNode {
  return (
    <Wrapper>
      <TokenLogo token={inputAmount?.currency} size={20} />
      <TokenAmount amount={inputAmount} tokenSymbol={inputAmount?.currency} />
      <Trans>for at least</Trans>
      <TokenLogo token={outputAmount?.currency} size={20} />
      <TokenAmount amount={outputAmount} tokenSymbol={outputAmount?.currency} />
    </Wrapper>
  )
}

// A div, not a p: the token logos are divs, and inside NewModalContent a p would also pick up its
// `p { ... }` rule, which outranks this class and drops the padding.
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  width: 100%;
  min-height: 40px;
  margin: 0;
  padding: 10px 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  ${font('FONT_NORMAL')}
  color: var(${UI.COLOR_TEXT});
`
