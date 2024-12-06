import { TokenLogo } from '@cowprotocol/tokens'
import { TokenSymbol, UI } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { RateImpactIndicator } from 'modules/limitOrders/pure/RateImpactIndicator'

type Props = {
  currency: Currency | null
  inputCurrency: Currency | null
  rateImpact: number
  toggleIcon?: React.ReactNode
  onToggle?: () => void
}

const Wrapper = styled.span<{ clickable: boolean }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  gap: 0 3px;
  font-size: 13px;
  font-weight: 400;
  margin: auto 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: ${({ clickable }) => (clickable ? 0.7 : 1)};
  }
`

const TokenWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
`

export function HeadingText({ inputCurrency, currency, rateImpact, toggleIcon, onToggle }: Props) {
  if (!currency) {
    return <Wrapper clickable={false}>Select input and output</Wrapper>
  }

  return (
    <Wrapper clickable={!!onToggle} onClick={onToggle}>
      {toggleIcon}
      When
      <TokenWrapper>
        1
        <TokenLogo token={currency} size={16} />
        <TokenSymbol token={currency} />
      </TokenWrapper>
      is worth
      {<RateImpactIndicator inputCurrency={inputCurrency} rateImpact={rateImpact} />}
    </Wrapper>
  )
}
