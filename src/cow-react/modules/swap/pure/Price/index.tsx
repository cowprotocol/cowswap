import { BoxProps } from 'rebass'
import { Trans } from '@lingui/macro'
import { Repeat } from 'react-feather'
import TradePrice from 'components/swap/TradePrice'
import TradeGp from 'state/swap/TradeGp'
import styled from 'styled-components/macro'
import { LowerSectionWrapper } from '@cow/modules/swap/pure/styled'
import { StyledRowBetween, TextWrapper } from '@cow/modules/swap/pure/Row/styled'
import { AutoRow } from 'components/Row'
import { useState } from 'react'

const PriceSwitcher = styled(AutoRow)`
  flex-flow: row nowrap;
  gap: 4px;

  > svg {
    cursor: pointer;
    border-radius: 20px;
    padding: 4px;
  }
`

const StyledRepeat = styled(Repeat)`
  box-sizing: border-box;
  background: ${({ theme }) => theme.grey1};
`

interface PriceProps extends BoxProps {
  trade: TradeGp
}

export const Price: React.FC<PriceProps> = ({ trade, ...boxProps }: PriceProps) => {
  const [showInverted, setShowInverted] = useState<boolean>(false)

  return (
    <LowerSectionWrapper {...boxProps}>
      <StyledRowBetween>
        <TextWrapper>
          <PriceSwitcher>
            <Trans>Price</Trans>
            <StyledRepeat size={20} onClick={() => setShowInverted((prev) => !prev)} />
          </PriceSwitcher>
        </TextWrapper>
        <div className="price-container">
          <TradePrice price={trade.executionPrice} showInverted={showInverted} setShowInverted={setShowInverted} />
        </div>
      </StyledRowBetween>
    </LowerSectionWrapper>
  )
}
