import { BoxProps, Text } from 'rebass'
import { Trans } from '@lingui/macro'
import { Repeat } from 'react-feather'
import TradePrice from 'components/swap/TradePrice'
import TradeGp from 'state/swap/TradeGp'
import styled from 'styled-components/macro'
import { LowerSectionWrapper } from 'cow-react/swap/dumb/styled'
import { AutoRow } from 'components/Row'
import { useState } from 'react'

const PriceSwitcher = styled(AutoRow)`
  flex-flow: row nowrap;
  gap: 4px;
  min-width: 55px;

  > svg {
    cursor: pointer;
    border-radius: 20px;
    background: ${({ theme }) => theme.bg4};
    padding: 4px;
  }
`

const StyledRepeat = styled(Repeat)`
  box-sizing: border-box;
`

export interface PriceProps extends BoxProps {
  trade: TradeGp
}

export const Price: React.FC<PriceProps> = ({ trade, ...boxProps }: PriceProps) => {
  const [showInverted, setShowInverted] = useState<boolean>(false)

  return (
    <LowerSectionWrapper {...boxProps}>
      <Text fontWeight={500} fontSize={13}>
        <PriceSwitcher>
          <Trans>Price</Trans>
          <StyledRepeat size={20} onClick={() => setShowInverted((prev) => !prev)} />
        </PriceSwitcher>
      </Text>
      <div className="price-container">
        <TradePrice price={trade.executionPrice} showInverted={showInverted} setShowInverted={setShowInverted} />
      </div>
    </LowerSectionWrapper>
  )
}
