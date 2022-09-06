import { BoxProps, Text } from 'rebass'
import { Trans } from '@lingui/macro'
import { Repeat } from 'react-feather'
import TradePrice from 'components/swap/TradePrice'
import TradeGp from 'state/swap/TradeGp'
import styled, { ThemeContext } from 'styled-components/macro'
import { LowerSectionWrapper } from 'pages/Swap/styled'
import { AutoRow } from 'components/Row'
import { useContext, useState } from 'react'

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

interface PriceProps extends BoxProps {
  trade: TradeGp
}

export const Price: React.FC<PriceProps> = ({ trade, ...boxProps }: PriceProps) => {
  const theme = useContext(ThemeContext)
  const [showInverted, setShowInverted] = useState<boolean>(false)

  return (
    <LowerSectionWrapper {...boxProps}>
      <Text fontWeight={500} fontSize={14} color={theme.text2}>
        <PriceSwitcher>
          <Trans>Price</Trans>
          <Repeat size={20} onClick={() => setShowInverted((prev) => !prev)} />
        </PriceSwitcher>
      </Text>
      <div className="price-container">
        <TradePrice price={trade.executionPrice} showInverted={showInverted} setShowInverted={setShowInverted} />
      </div>
    </LowerSectionWrapper>
  )
}
